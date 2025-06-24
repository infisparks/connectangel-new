"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import { approveCreator, type CreatorApproval } from "@/actions/admin-actions"
import { useActionState } from "react"
import { toast } from "@/hooks/use-toast" // Assuming you have a useToast hook

export function AdminApprovalCard({ approval }: { approval: CreatorApproval }) {
  const [state, formAction, isPending] = useActionState(async (_: any, formData: FormData) => {
    const approvalId = formData.get("approvalId") as string
    const result = await approveCreator(approvalId)
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
    return result
  }, null)

  return (
    <Card className="bg-gray-800 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-400">{approval.startup_name}</CardTitle>
        <CardDescription className="text-gray-400">
          {approval.startup_type} • {approval.domain}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center">
          {approval.thumbnail_url ? (
            <Image
              src={approval.thumbnail_url || "/placeholder.svg"}
              alt={`${approval.startup_name} Thumbnail`}
              fill
              style={{ objectFit: "cover" }}
              className="opacity-70"
            />
          ) : (
            <Image
              src="/placeholder.svg?height=200&width=400"
              alt="Thumbnail Placeholder"
              fill
              style={{ objectFit: "cover" }}
              className="opacity-70"
            />
          )}
          {approval.pitch_video_url && (
            <a href={approval.pitch_video_url} target="_blank" rel="noopener noreferrer" className="absolute">
              <Play className="h-16 w-16 text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
            </a>
          )}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{approval.description}</p>
        <div className="flex flex-wrap gap-2">
          {approval.founder_names?.filter(Boolean).map((name, idx) => (
            <span key={idx} className="inline-block bg-gray-700 text-white text-xs px-3 py-1 rounded-full font-medium">
              {name}
            </span>
          ))}
        </div>
        <div className="text-gray-400 text-sm">
          <span>Location: {approval.location}</span> • <span>Language: {approval.language}</span>
        </div>
        <div className="text-gray-400 text-xs">Submitted: {new Date(approval.created_at).toLocaleDateString()}</div>
      </CardContent>
      <CardFooter>
        <form action={formAction} className="w-full">
          <input type="hidden" name="approvalId" value={approval.id} />
          <Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700" disabled={isPending}>
            {isPending ? "Approving..." : "Approve Creator"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
