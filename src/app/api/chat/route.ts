import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { encryptMessage, safeDecryptMessage } from "@/lib/encryption";

// GET: Fetch chat messages
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is banned from chat
    const banCheck = await executeQuery<any[]>(
      `SELECT * FROM chat_bans 
       WHERE user_id = ? AND (is_permanent = true OR expires_at > NOW())`,
      [user.id]
    );

    if (banCheck && banCheck.length > 0) {
      const ban = banCheck[0];
      return NextResponse.json(
        {
          error: "You are banned from the chat",
          reason: ban.reason,
          isPermanent: ban.is_permanent,
          expiresAt: ban.expires_at,
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // Message ID to fetch messages before
    const privateUserId = searchParams.get("private_user_id"); // For private messages

    let query = `
      SELECT 
        cm.id,
        cm.sender_id as senderId,
        u_sender.username as senderUsername,
        u_sender.role as senderRole,
        cm.recipient_id as recipientId,
        u_recipient.username as recipientUsername,
        cm.message,
        cm.is_private as isPrivate,
        cm.is_edited as isEdited,
        cm.edited_by as editedBy,
        u_editor.username as editorUsername,
        cm.created_at as createdAt,
        cm.updated_at as updatedAt
      FROM chat_messages cm
      JOIN users u_sender ON cm.sender_id = u_sender.id
      LEFT JOIN users u_recipient ON cm.recipient_id = u_recipient.id
      LEFT JOIN users u_editor ON cm.edited_by = u_editor.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Filter for private messages if requested
    if (privateUserId) {
      // Only admins can see private messages between other users
      if (user.role === "admin") {
        query += ` AND cm.is_private = true AND (
          (cm.sender_id = ? AND cm.recipient_id = ?) OR 
          (cm.sender_id = ? AND cm.recipient_id = ?)
        )`;
        queryParams.push(user.id, privateUserId, privateUserId, user.id);
      } else {
        query += ` AND cm.is_private = true AND (
          (cm.sender_id = ? AND cm.recipient_id = ?) OR 
          (cm.sender_id = ? AND cm.recipient_id = ?)
        )`;
        queryParams.push(user.id, privateUserId, privateUserId, user.id);
      }
    } else {
      // Public messages or private messages involving the current user
      query += ` AND cm.is_private = true AND (
          (cm.sender_id = ? AND cm.recipient_id = ?) OR 
          (cm.sender_id = ? AND cm.recipient_id = ?)
        )`;
      queryParams.push(user.id, privateUserId, privateUserId, user.id);
    }

    // Pagination using message ID
    if (before) {
      query += ` AND cm.id < ?`;
      queryParams.push(before);
    }

    query += ` ORDER BY cm.created_at DESC LIMIT ?`;
    queryParams.push(String(limit)); // Convert limit to string to avoid type mismatch with prepared statement

    const messages = await executeQuery<any[]>(query, queryParams);

    // Decrypt all messages
    if (messages && messages.length > 0) {
      messages.forEach((msg) => {
        msg.message = safeDecryptMessage(msg.message);
      });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is banned from chat
    const banCheck = await executeQuery<any[]>(
      `SELECT * FROM chat_bans 
       WHERE user_id = ? AND (is_permanent = true OR expires_at > NOW())`,
      [user.id]
    );

    if (banCheck && banCheck.length > 0) {
      const ban = banCheck[0];
      return NextResponse.json(
        {
          error: "You are banned from the chat",
          reason: ban.reason,
          isPermanent: ban.is_permanent,
          expiresAt: ban.expires_at,
        },
        { status: 403 }
      );
    }

    // Check if user is muted
    const muteCheck = await executeQuery<any[]>(
      `SELECT * FROM chat_mutes 
       WHERE user_id = ? AND expires_at > NOW()`,
      [user.id]
    );

    if (muteCheck && muteCheck.length > 0) {
      const mute = muteCheck[0];
      return NextResponse.json(
        {
          error: "You are muted in the chat",
          reason: mute.reason,
          expiresAt: mute.expires_at,
        },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      message,
      recipientId = null,
      isPrivate = false,
    } = await request.json();

    // Validate required fields
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Check private message permissions
    if (isPrivate) {
      // Only admins can initiate private messages
      if (user.role !== "admin") {
        // Check if this is a response to an admin message
        const previousMessages = await executeQuery<any[]>(
          `SELECT * FROM chat_messages WHERE recipient_id = ? AND sender_id = ? AND is_private = true ORDER BY created_at DESC LIMIT 1`,
          [user.id, recipientId]
        );

        if (
          !previousMessages ||
          previousMessages.length === 0 ||
          previousMessages[0].sender_id !== recipientId
        ) {
          return NextResponse.json(
            { error: "Only admins can initiate private messages" },
            { status: 403 }
          );
        }
      }

      // Recipient is required for private messages
      if (!recipientId) {
        return NextResponse.json(
          { error: "Recipient is required for private messages" },
          { status: 400 }
        );
      }

      // Verify recipient exists
      const recipientCheck = await executeQuery<any[]>(
        `SELECT id FROM users WHERE id = ?`,
        [recipientId]
      );

      if (!recipientCheck || recipientCheck.length === 0) {
        return NextResponse.json(
          { error: "Recipient user not found" },
          { status: 404 }
        );
      }
    } else if (recipientId) {
      // Non-private messages cannot have a recipient
      return NextResponse.json(
        { error: "Public messages cannot have a specific recipient" },
        { status: 400 }
      );
    }

    // Encrypt the message before storing
    const encryptedMessage = encryptMessage(message);

    // Insert message into database
    const result = await executeQuery(
      `INSERT INTO chat_messages 
        (sender_id, recipient_id, message, is_private) 
       VALUES (?, ?, ?, ?)`,
      [user.id, recipientId, encryptedMessage, isPrivate]
    );

    // Fetch the newly created message with user details
    const newMessage = await executeQuery<any[]>(
      `SELECT 
        cm.id,
        cm.sender_id as senderId,
        u_sender.username as senderUsername,
        u_sender.role as senderRole,
        cm.recipient_id as recipientId,
        u_recipient.username as recipientUsername,
        cm.message,
        cm.is_private as isPrivate,
        cm.is_edited as isEdited,
        cm.created_at as createdAt
      FROM chat_messages cm
      JOIN users u_sender ON cm.sender_id = u_sender.id
      LEFT JOIN users u_recipient ON cm.recipient_id = u_recipient.id
      WHERE cm.id = ?`,
      [(result as any).insertId]
    );

    // Decrypt the message for the response
    if (newMessage && newMessage.length > 0) {
      newMessage[0].message = safeDecryptMessage(newMessage[0].message);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      chatMessage: newMessage[0],
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PUT: Edit a message
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const { messageId, message } = await request.json();

    // Validate required fields
    if (!messageId || !message || message.trim() === "") {
      return NextResponse.json(
        { error: "Message ID and content are required" },
        { status: 400 }
      );
    }

    // Get the message to edit
    const existingMessages = await executeQuery<any[]>(
      `SELECT * FROM chat_messages WHERE id = ?`,
      [messageId]
    );

    if (!existingMessages || existingMessages.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const existingMessage = existingMessages[0];

    // Check permissions - only the sender or an admin can edit a message
    if (existingMessage.sender_id !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to edit this message" },
        { status: 403 }
      );
    }

    // Encrypt the updated message
    const encryptedMessage = encryptMessage(message);

    // Update the message
    await executeQuery(
      `UPDATE chat_messages 
       SET message = ?, is_edited = true, edited_by = ?, updated_at = NOW() 
       WHERE id = ?`,
      [encryptedMessage, user.id, messageId]
    );

    // Fetch the updated message
    const updatedMessage = await executeQuery<any[]>(
      `SELECT 
        cm.id,
        cm.sender_id as senderId,
        u_sender.username as senderUsername,
        u_sender.role as senderRole,
        cm.recipient_id as recipientId,
        u_recipient.username as recipientUsername,
        cm.message,
        cm.is_private as isPrivate,
        cm.is_edited as isEdited,
        cm.edited_by as editedBy,
        u_editor.username as editorUsername,
        cm.created_at as createdAt,
        cm.updated_at as updatedAt
      FROM chat_messages cm
      JOIN users u_sender ON cm.sender_id = u_sender.id
      LEFT JOIN users u_recipient ON cm.recipient_id = u_recipient.id
      LEFT JOIN users u_editor ON cm.edited_by = u_editor.id
      WHERE cm.id = ?`,
      [messageId]
    );

    // Decrypt the message for the response
    if (updatedMessage && updatedMessage.length > 0) {
      updatedMessage[0].message = safeDecryptMessage(updatedMessage[0].message);
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
      chatMessage: updatedMessage[0],
    });
  } catch (error) {
    console.error("Error updating chat message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a message
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get message ID from URL
    const messageId = request.nextUrl.searchParams.get("id");
    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Get the message to delete
    const existingMessages = await executeQuery<any[]>(
      `SELECT * FROM chat_messages WHERE id = ?`,
      [messageId]
    );

    if (!existingMessages || existingMessages.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const existingMessage = existingMessages[0];

    // Check permissions - only the sender or an admin can delete a message
    if (existingMessage.sender_id !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to delete this message" },
        { status: 403 }
      );
    }

    // Delete the message
    await executeQuery(`DELETE FROM chat_messages WHERE id = ?`, [messageId]);

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
