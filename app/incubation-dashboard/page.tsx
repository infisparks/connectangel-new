"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaselib";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IncubationRequest {
  id: string;
  startup_id: string;
  incubation_id: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  creator: {
    startup_name: string;
  };
}

export default function IncubationDashboardPage() {
  const [requests, setRequests] = useState<IncubationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [incubationId, setIncubationId] = useState<string | null>(null);

  const fetchIncubationRequests = useCallback(async (currentUserId: string) => {
    setLoading(true);
    const { data: incubationData, error: incubationError } = await supabase
      .from("incubation")
      .select("id, incubator_accelerator_name")
      .eq("user_id", currentUserId)
      .single();

    if (incubationError || !incubationData) {
      console.error("Error fetching incubation ID:", incubationError);
      toast.error("Could not find your incubation profile.");
      setLoading(false);
      return;
    }

    setIncubationId(incubationData.id);

    const { data: requestsData, error: requestsError } = await supabase
      .from("incubation_request")
      .select("*, creator(startup_name)")
      .eq("incubation_id", incubationData.id)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
      toast.error("Failed to load requests.");
    } else {
      setRequests(requestsData as IncubationRequest[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchIncubationRequests(user.id);
      } else {
        setLoading(false);
        toast.error("You must be logged in to view this page.");
      }
    };
    checkUser();
  }, [fetchIncubationRequests]);

  const handleRequestAction = async (requestId: string, action: "accept" | "reject") => {
    setIsProcessing(true);
    try {
      const requestToUpdate = requests.find(req => req.id === requestId);
      if (!requestToUpdate) {
        throw new Error("Request not found.");
      }

      const { error: updateRequestError } = await supabase
        .from("incubation_request")
        .update({ status: action, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (updateRequestError) {
        throw new Error(updateRequestError.message);
      }

      if (action === "accept") {
        const { data: incubationNameData, error: incubationNameError } = await supabase
          .from("incubation")
          .select("incubator_accelerator_name")
          .eq("id", incubationId)
          .single();

        if (incubationNameError || !incubationNameData) {
          throw new Error("Could not fetch incubation name.");
        }

        const { error: updateStartupError } = await supabase
          .from("creator")
          .update({
            is_incubation: true,
            incubation_id: incubationId,
            incubation_name: incubationNameData.incubator_accelerator_name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestToUpdate.startup_id);

        if (updateStartupError) {
          throw new Error(updateStartupError.message);
        }
      }

      toast.success(`Request ${action === "accept" ? "accepted" : "rejected"} successfully!`);
      if (userId) {
        fetchIncubationRequests(userId);
      }
    } catch (err: any) {
      console.error("Request action failed:", err);
      toast.error(`Failed to ${action} request: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-purple-400">Incubation Dashboard</h1>
      <p className="text-gray-400">Manage incoming requests from startups to join your incubation.</p>
      
      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No new requests.</div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className={cn(
                "p-6 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm shadow-md transition-colors",
                request.status === "accepted" ? "bg-green-500/10 border-green-700" :
                request.status === "rejected" ? "bg-red-500/10 border-red-700" : ""
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Request from: {request.creator.startup_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Status: <span className="font-medium">{request.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/startup/${request.startup_id}`} passHref>
                    <Button
                      variant="ghost"
                      className="text-white border border-white/20 bg-transparent hover:bg-white/10 hover:backdrop-blur-md"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {request.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleRequestAction(request.id, "accept")}
                        className="bg-green-500/20 text-white border border-green-500/50 hover:bg-green-500/40 hover:backdrop-blur-md"
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleRequestAction(request.id, "reject")}
                        className="bg-red-500/20 text-white border border-red-500/50 hover:bg-red-500/40 hover:backdrop-blur-md"
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {request.message && (
                <div className="mt-4 p-4 rounded-lg border border-gray-700 bg-gray-900/50 backdrop-blur-sm text-gray-300">
                  <p className="font-medium mb-2">Message:</p>
                  <p className="text-sm">{request.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}