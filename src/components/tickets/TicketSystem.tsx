"use client";

import { useState, useEffect } from "react";
import { Ticket, TicketResponse, User, TicketSystemProps } from "./types";
import TicketList from "./TicketList";
import TicketDetail from "./TicketDetail";
import NewTicketForm from "./NewTicketForm";
import AdminPanel from "./AdminPanel";

const TicketSystem = ({ currentUser }: TicketSystemProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [view, setView] = useState<"all" | "my" | "assigned">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Fetch tickets on component mount and view change
  useEffect(() => {
    setPage(1);
    fetchTickets(true);
  }, [view]);

  // Set up polling for new tickets/updates with exponential backoff
  useEffect(() => {
    let pollInterval = 30000; // Start with 30 seconds
    let timeoutId: NodeJS.Timeout;

    const poll = () => {
      const now = Date.now();
      // Only poll if it's been at least 30 seconds since the last update
      if (now - lastUpdate >= 30000) {
        fetchTickets(false);
      }
      // Increase interval up to 5 minutes
      pollInterval = Math.min(pollInterval * 1.5, 300000);
      timeoutId = setTimeout(poll, pollInterval);
    };

    timeoutId = setTimeout(poll, pollInterval);

    return () => clearTimeout(timeoutId);
  }, [lastUpdate]);

  // Fetch tickets based on current view with pagination
  const fetchTickets = async (showLoading = true, resetPage = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      let url = `/api/tickets?page=${resetPage ? 1 : page}&limit=10`;
      if (view === "my") {
        url += "&filter=my";
      } else if (view === "assigned") {
        url += "&filter=assigned";
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch tickets";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          errorMessage = response.statusText || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      const data = await response.json();
      
      if (resetPage) {
        setTickets(data.tickets || []);
      } else {
        setTickets(prev => [...prev, ...(data.tickets || [])]);
      }
      
      setHasMore(data.tickets?.length === 10);
      setLastUpdate(Date.now());
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching tickets:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Load more tickets
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchTickets(false);
    }
  };

  // Fetch responses for a specific ticket
  const fetchTicketResponses = async (ticketId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tickets/${ticketId}/responses`);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch ticket responses";

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
        setTicketResponses(data.responses || []);
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        setError("Error parsing server response");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching ticket responses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Select a ticket to view details
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchTicketResponses(ticket.id);
  };

  // Add a response to a ticket
  const handleAddResponse = async (
    ticketId: number,
    message: string,
    isInternal: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          isInternal,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to add response";

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      // Parse JSON response
      let data;
      try {
        const data = await response.json();
        // Add the new response to the list
        if (data && data.response) {
          setTicketResponses((prev) => [...prev, data.response]);
        }

        // Refresh the ticket to get updated status
        fetchTickets(false);
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        setError("Error parsing server response");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error adding response:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new ticket
  const handleCreateTicket = async (
    subject: string,
    description: string,
    priority: Ticket["priority"]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          description,
          priority,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to create ticket";

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      // Parse JSON response
      let data;
      try {
        const data = await response.json();
        // Add the new ticket to the list
        if (data && data.ticket) {
          setTickets((prev) => [data.ticket, ...prev]);
          setShowNewTicketForm(false);
        }
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        setError("Error parsing server response");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error creating ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const handleUpdateTicketStatus = async (
    ticketId: number,
    status: Ticket["status"]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to update ticket status";

        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
        // Update the ticket in the list
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: status } : ticket
          )
        );
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        setError("Error parsing server response");
      }

      // Update the selected ticket if it's the one being modified
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status });
      }

      // Refresh responses to show the status change
      fetchTicketResponses(ticketId);
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating ticket status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Assign ticket to user (admin only)
  const handleAssignTicket = async (ticketId: number, userId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedTo: userId,
        }),
      });

      const data: {
        assignedTo: number;
        assignedUsername: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to assign ticket");
        return;
      }

      // Update the ticket in the list
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                assignedTo: data.assignedTo,
                assignedUsername: data.assignedUsername,
              }
            : ticket
        )
      );

      // Update the selected ticket if it's the one being modified
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          assignedTo: data.assignedTo,
          assignedUsername: data.assignedUsername,
        });
      }

      // Refresh responses to show the assignment change
      fetchTicketResponses(ticketId);
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error assigning ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update ticket priority
  const handleUpdatePriority = async (
    ticketId: number,
    priority: Ticket["priority"]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tickets/${ticketId}/priority`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority,
        }),
      });

      const data: {
        assignedTo: number;
        assignedUsername: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update ticket priority");
        return;
      }

      // Update the ticket in the list
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, priority: priority } : ticket
        )
      );

      // Update the selected ticket if it's the one being modified
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority: priority });
      }

      // Refresh responses to show the priority change
      fetchTicketResponses(ticketId);
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error updating ticket priority:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] border border-gray-200/50 dark:border-gray-700/50">
      {/* Ticket System Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-3 flex justify-between items-center">
        <h3 className="text-white font-medium text-sm">
          {selectedTicket
            ? `Ticket #${selectedTicket.id}: ${selectedTicket.subject}`
            : "Support Tickets"}
        </h3>
        <div className="flex space-x-2">
          {!selectedTicket && (
            <button
              onClick={() => setShowNewTicketForm(!showNewTicketForm)}
              className="text-xs bg-green-500/90 hover:bg-green-600 text-white py-1.5 px-3 rounded-lg transition-all duration-200 hover:shadow-md flex items-center"
            >
              {showNewTicketForm ? "Cancel" : "New Ticket"}
            </button>
          )}
          {selectedTicket && (
            <button
              onClick={() => {
                setSelectedTicket(null);
                setTicketResponses([]);
              }}
              className="text-xs bg-gray-600/90 hover:bg-gray-700 text-white py-1.5 px-3 rounded-lg transition-all duration-200 hover:shadow-md flex items-center"
            >
              Back to List
            </button>
          )}
        </div>
      </div>

      {/* View Filters */}
      {!selectedTicket && !showNewTicketForm && (
        <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <button
            onClick={() => setView("all")}
            className={`flex-1 py-3 text-xs font-medium transition-all duration-200 ${
              view === "all"
                ? "text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setView("my")}
            className={`flex-1 py-3 text-xs font-medium transition-all duration-200 ${
              view === "my"
                ? "text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            }`}
          >
            My Tickets
          </button>
          {currentUser.role === "admin" && (
            <button
              onClick={() => setView("assigned")}
              className={`flex-1 py-3 text-xs font-medium transition-all duration-200 ${
                view === "assigned"
                  ? "text-blue-600 border-b-2 border-blue-500 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              }`}
            >
              Assigned to Me
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {error && (
          <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm p-3 rounded-lg border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200 text-xs mb-4 shadow-sm">
            {error}
          </div>
        )}

        {currentUser.role === "admin" &&
          !selectedTicket &&
          !showNewTicketForm && (
            <AdminPanel
              tickets={tickets}
              onUpdateStatus={handleUpdateTicketStatus}
              onAssign={handleAssignTicket}
              onUpdatePriority={handleUpdatePriority}
              onSelectTicket={handleSelectTicket}
              loading={loading}
            />
          )}

        {loading &&
        tickets.length === 0 &&
        !selectedTicket &&
        !showNewTicketForm ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : showNewTicketForm ? (
          <NewTicketForm
            onSubmit={handleCreateTicket}
            onCancel={() => setShowNewTicketForm(false)}
          />
        ) : selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            responses={ticketResponses}
            currentUser={currentUser}
            onAddResponse={handleAddResponse}
            onUpdateStatus={handleUpdateTicketStatus}
            onAssign={handleAssignTicket}
            onUpdatePriority={handleUpdatePriority}
            loading={loading}
          />
        ) : !showNewTicketForm ? (
          <TicketList
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            currentUser={currentUser}
            onLoadMore={loadMore}
          />
        ) : (
          <TicketList
            tickets={tickets}
            onSelectTicket={handleSelectTicket}
            currentUser={currentUser}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  );
};

export default TicketSystem;
