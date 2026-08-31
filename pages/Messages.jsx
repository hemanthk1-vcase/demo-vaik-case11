import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Inbox, Send, Paperclip, Reply, Plus } from 'lucide-react';

function Empty({ label = 'No messages' }) {
  return (
    <div className="text-center py-12 flex flex-col items-center gap-3 text-muted-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Mail className="h-6 w-6" /></div>
      <div>{label}</div>
    </div>
  );
}

function MessageRow({ m, me, onOpen }) {
  const d = m.data || {};
  const unread = d.recipient_id === me.id && !d.is_read;
  return (
    <button onClick={() => onOpen(m)} className={`flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md transition ${unread ? 'border-primary/30 bg-primary/5' : ''}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{d.subject || '(no subject)'}</span>{unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}</div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{d.body}</p>
        <div className="mt-1 text-[10px] text-muted-foreground">{new Date(m.created_date).toLocaleString()}</div>
      </div>
    </button>
  );
}

export default function Messages() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [cases, setCases] = useState([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [form, setForm] = useState({ recipient_id: '', subject: '', body: '', case_id: '', attachments: '' });
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try { setMessages(await base44.entities.Message.list('-created_date', 200)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    base44.entities.LawyerProfile.filter({ is_verified: true, is_active: true })
      .then((l) => setRecipients(l.map((p) => ({ id: p.data.user_id, label: p.data.full_name }))))
      .catch(() => {});
    base44.entities.User.list()
      .then((u) => setRecipients((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        return [...prev, ...u.filter((x) => x.id !== user?.id && !ids.has(x.id)).map((x) => ({ id: x.id, label: x.full_name || x.email }))];
      }))
      .catch(() => {});
    base44.entities.Case.list('-updated_date', 100).then(setCases).catch(() => {});
  }, []);

  const inbox = useMemo(() => messages.filter((m) => m.data?.recipient_id === user?.id), [messages, user]);
  const sent = useMemo(() => messages.filter((m) => m.data?.sender_id === user?.id), [messages, user]);

  async function openMessage(m) {
    setDetail(m);
    setReplyBody('');
    if (m.data?.recipient_id === user?.id && !m.data?.is_read) {
      try { await base44.entities.Message.update(m.id, { is_read: true }); load(); } catch {}
    }
  }

  async function send(e) {
    e.preventDefault();
    if (!form.recipient_id) { toast({ variant: 'destructive', title: 'Select a recipient' }); return; }
    try {
      await base44.entities.Message.create({
        sender_id: user.id, recipient_id: form.recipient_id, subject: form.subject, body: form.body,
        case_id: form.case_id || undefined, attachments: form.attachments || undefined,
        message_type: form.case_id ? 'case_related' : 'direct'
      });
      toast({ title: 'Message sent' });
      setForm({ recipient_id: '', subject: '', body: '', case_id: '', attachments: '' });
      setComposeOpen(false); load();
    } catch (e2) { toast({ variant: 'destructive', title: 'Failed', description: e2.message }); }
  }

  async function reply() {
    try {
      await base44.entities.Message.create({
        sender_id: user.id, recipient_id: detail.data.sender_id,
        subject: detail.data.subject ? 'Re: ' + detail.data.subject : '', body: replyBody,
        case_id: detail.data.case_id, message_type: detail.data.case_id ? 'case_related' : 'direct'
      });
      toast({ title: 'Reply sent' }); setReplyBody(''); setDetail(null); load();
    } catch (e) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
  }

  async function attach(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setForm((s) => ({ ...s, attachments: s.attachments ? s.attachments + ',' + file_url : file_url }));
    } catch { toast({ variant: 'destructive', title: 'Upload failed' }); }
    finally { setUploading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Communicate with clients and lawyers.</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Compose</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New message</DialogTitle></DialogHeader>
            <form onSubmit={send} className="space-y-4">
              <div className="space-y-1.5"><Label>Recipient *</Label>
                <Select value={form.recipient_id} onValueChange={(v) => setForm((s) => ({ ...s, recipient_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                  <SelectContent>{recipients.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Related case (optional)</Label>
                <Select value={form.case_id} onValueChange={(v) => setForm((s) => ({ ...s, case_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Body *</Label><Textarea value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} rows={4} required /></div>
              <div className="space-y-1.5"><Label>Attachment</Label><Input type="file" onChange={attach} disabled={uploading} />{form.attachments && <div className="text-xs text-emerald-600">Attached</div>}</div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button><Button type="submit">Send</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-1.5" />Inbox</TabsTrigger>
          <TabsTrigger value="sent"><Send className="h-4 w-4 mr-1.5" />Sent</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          {loading ? <div className="text-center text-sm text-muted-foreground py-12">Loading…</div> : inbox.length === 0 ? <Empty /> : (
            <div className="space-y-2">{inbox.map((m) => <MessageRow key={m.id} m={m} me={user} onOpen={openMessage} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="sent">
          {loading ? <div className="text-center text-sm text-muted-foreground py-12">Loading…</div> : sent.length === 0 ? <Empty label="No sent messages" /> : (
            <div className="space-y-2">{sent.map((m) => <MessageRow key={m.id} m={m} me={user} onOpen={openMessage} />)}</div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (() => {
            const d = detail.data || {};
            const fromLabel = recipients.find((r) => r.id === d.sender_id)?.label || d.sender_id;
            const toLabel = recipients.find((r) => r.id === d.recipient_id)?.label || d.recipient_id;
            return (
              <>
                <DialogHeader><DialogTitle>{d.subject || '(no subject)'}</DialogTitle></DialogHeader>
                <div className="text-xs text-muted-foreground mb-2">{d.sender_id === user.id ? `To: ${toLabel}` : `From: ${fromLabel}`} · {new Date(detail.created_date).toLocaleString()}</div>
                <p className="text-sm whitespace-pre-line">{d.body}</p>
                {d.attachments && d.attachments.split(',').map((a, i) => (
                  <a key={i} href={a} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"><Paperclip className="h-3 w-3" />Attachment {i + 1}</a>
                ))}
                {d.sender_id !== user.id && (
                  <div className="mt-4 border-t border-border pt-4 space-y-2">
                    <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Reply…" rows={3} />
                    <Button size="sm" onClick={reply} disabled={!replyBody.trim()}><Reply className="h-4 w-4 mr-1.5" />Reply</Button>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}