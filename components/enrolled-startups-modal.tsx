// components/enrolled-startups-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApprovedStartup } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface EnrolledStartupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  startups: ApprovedStartup[];
  incubationName: string;
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("/storage/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}${path}`;
  }
  return path;
};


export function EnrolledStartupsModal({ isOpen, onClose, startups, incubationName }: EnrolledStartupsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-purple-400">Enrolled Startups</DialogTitle>
          <DialogDescription className="text-gray-400">
            A list of all startups currently enrolled in {incubationName}.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          {startups.length > 0 ? (
            <div className="grid gap-4">
              {startups.map((startup) => (
                <div key={startup.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                     <Image
                        src={getImageUrl(startup.logo_url)}
                        alt={`${startup.startup_name} Logo`}
                        layout="fill"
                        objectFit="cover"
                        className="bg-gray-700"
                      />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100">{startup.startup_name}</h4>
                    <p className="text-sm text-gray-400">{startup.domain}</p>
                    <p className="text-xs text-gray-500 mt-1">{startup.location}</p>
                  </div>
                   <Badge variant="outline" className="border-green-500 text-green-400">
                      Approved
                    </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No startups are currently enrolled in your incubation program.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}