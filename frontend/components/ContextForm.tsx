'use client'

import { useState, useEffect } from 'react'
import { User, storage } from '@/lib/storage'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MessageSquare, Mail, FileText, Book } from 'lucide-react'
import { toast } from 'sonner'

interface ContextFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContextCreated: () => void
  user: User
}

export default function ContextForm({ open, onOpenChange, onContextCreated, user }: ContextFormProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'email' | 'message' | 'note' | 'document'>('note')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset form
      setContent('')
      setType('note')
      setSource('')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      storage.addContextEntry({
        content: content.trim(),
        type,
        source: source.trim() || undefined,
        metadata: {},
        user_id: user.id
      })

      onContextCreated()
      toast.success('Context entry added successfully!')
    } catch (error: any) {
      toast.error('Failed to add context: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (contextType: string) => {
    switch (contextType) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <Book className="h-4 w-4" />
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case 'email':
        return 'Paste email content here...\n\nExample:\nFrom: colleague@company.com\nSubject: Project deadline\nThe quarterly report deadline has been moved to next Friday...'
      case 'message':
        return 'Paste message or chat content here...\n\nExample:\nSlack/WhatsApp message:\n"Hey, can we schedule a meeting to discuss the new feature requirements?"'
      case 'document':
        return 'Paste document content or summary here...\n\nExample:\nMeeting notes, requirements doc, or any relevant document content...'
      default:
        return 'Add your personal notes here...\n\nExample:\nRemember to call the dentist for appointment\nPick up groceries after work\nReview project proposal before Monday'
    }
  }

  const getSourcePlaceholder = () => {
    switch (type) {
      case 'email': return 'e.g., Gmail, Outlook, work email'
      case 'message': return 'e.g., Slack, WhatsApp, Teams'
      case 'document': return 'e.g., Google Docs, Meeting notes'
      default: return 'e.g., Personal notes, Voice memo'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(type)}
            Add Context Entry
          </DialogTitle>
          <DialogDescription>
            Add context from emails, messages, notes, or documents to help AI understand your tasks better.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="message">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message/Chat
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Personal Note
                    </div>
                  </SelectItem>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Document
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source (Optional)</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder={getSourcePlaceholder()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              rows={8}
              required
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading ? 'Adding...' : 'Add Context'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}