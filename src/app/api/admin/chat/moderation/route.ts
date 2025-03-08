import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST: Ban or mute a user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Parse request body
    const { userId, action, reason, duration = null, isPermanent = false } = await request.json();

    // Validate required fields
    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userCheck = await executeQuery<any[]>(
      `SELECT id FROM users WHERE id = ?`,
      [userId]
    );

    if (!userCheck || userCheck.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate expiration date if duration is provided
    let expiresAt = null;
    if (action === "mute" || (action === "ban" && !isPermanent)) {
      if (!duration) {
        return NextResponse.json(
          { error: "Duration is required for temporary actions" },
          { status: 400 }
        );
      }
      
      // Calculate expiration date based on duration (in hours)
      const now = new Date();
      expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);
    }

    if (action === "ban") {
      // Check if user is already banned
      const existingBan = await executeQuery<any[]>(
        `SELECT * FROM chat_bans 
         WHERE user_id = ? AND (is_permanent = true OR expires_at > NOW())`,
        [userId]
      );

      if (existingBan && existingBan.length > 0) {
        // Update existing ban
        await executeQuery(
          `UPDATE chat_bans 
           SET reason = ?, is_permanent = ?, expires_at = ?, banned_by = ? 
           WHERE user_id = ?`,
          [reason, isPermanent, expiresAt, user.id, userId]
        );
      } else {
        // Create new ban
        await executeQuery(
          `INSERT INTO chat_bans 
            (user_id, banned_by, reason, is_permanent, expires_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, user.id, reason, isPermanent, expiresAt]
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: `User has been ${isPermanent ? 'permanently' : 'temporarily'} banned from chat`
      });
    } else if (action === "mute") {
      // Check if user is already muted
      const existingMute = await executeQuery<any[]>(
        `SELECT * FROM chat_mutes 
         WHERE user_id = ? AND expires_at > NOW()`,
        [userId]
      );

      if (existingMute && existingMute.length > 0) {
        // Update existing mute
        await executeQuery(
          `UPDATE chat_mutes 
           SET reason = ?, expires_at = ?, muted_by = ? 
           WHERE user_id = ?`,
          [reason, expiresAt, user.id, userId]
        );
      } else {
        // Create new mute
        await executeQuery(
          `INSERT INTO chat_mutes 
            (user_id, muted_by, reason, expires_at) 
           VALUES (?, ?, ?, ?)`,
          [userId, user.id, reason, expiresAt]
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: `User has been muted in chat until ${expiresAt?.toISOString()}`
      });
    } else if (action === "unban") {
      // Remove ban
      await executeQuery(
        `DELETE FROM chat_bans WHERE user_id = ?`,
        [userId]
      );

      return NextResponse.json({ 
        success: true, 
        message: "User has been unbanned from chat"
      });
    } else if (action === "unmute") {
      // Remove mute
      await executeQuery(
        `DELETE FROM chat_mutes WHERE user_id = ?`,
        [userId]
      );

      return NextResponse.json({ 
        success: true, 
        message: "User has been unmuted in chat"
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'ban', 'mute', 'unban', or 'unmute'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in chat moderation:", error);
    return NextResponse.json(
      { error: "Failed to perform moderation action" },
      { status: 500 }
    );
  }
}

// GET: Get banned and muted users
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
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

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 }
      );
    }

    // Get banned users
    const bannedUsers = await executeQuery<any[]>(
      `SELECT 
        cb.id,
        cb.user_id as userId,
        u.username,
        cb.reason,
        cb.is_permanent as isPermanent,
        cb.expires_at as expiresAt,
        cb.created_at as createdAt,
        cb.banned_by as bannedById,
        u_admin.username as bannedByUsername
      FROM chat_bans cb
      JOIN users u ON cb.user_id = u.id
      JOIN users u_admin ON cb.banned_by = u_admin.id
      WHERE cb.is_permanent = true OR cb.expires_at > NOW()
      ORDER BY cb.created_at DESC`
    );

    // Get muted users
    const mutedUsers = await executeQuery<any[]>(
      `SELECT 
        cm.id,
        cm.user_id as userId,
        u.username,
        cm.reason,
        cm.expires_at as expiresAt,
        cm.created_at as createdAt,
        cm.muted_by as mutedById,
        u_admin.username as mutedByUsername
      FROM chat_mutes cm
      JOIN users u ON cm.user_id = u.id
      JOIN users u_admin ON cm.muted_by = u_admin.id
      WHERE cm.expires_at > NOW()
      ORDER BY cm.created_at DESC`
    );

    return NextResponse.json({ 
      bannedUsers: bannedUsers || [],
      mutedUsers: mutedUsers || []
    });
  } catch (error) {
    console.error("Error fetching moderation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation data" },
      { status: 500 }
    );
  }
}