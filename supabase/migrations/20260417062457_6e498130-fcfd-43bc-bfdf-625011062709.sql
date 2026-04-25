
-- Add GST number to vendors and clients
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS gst_no TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS gst_no TEXT;

-- Add bill_type, party fields, GST breakdown to quotations
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS bill_type TEXT DEFAULT 'customer';
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS party_gst_no TEXT;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS cgst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS sgst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS igst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC DEFAULT 0;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS igst_amount NUMERIC DEFAULT 0;

-- Add same to payments (for invoice generation)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS bill_type TEXT DEFAULT 'customer';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS party_gst_no TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS party_email TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS cgst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sgst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS igst_percent NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS igst_amount NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Per-user chat: chat_threads (one per user) + chat_messages
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  user_name TEXT,
  user_email TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_admin BOOLEAN NOT NULL DEFAULT false,
  unread_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user','admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages(thread_id, created_at);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Threads: user sees own, admin sees all
CREATE POLICY "Users view own thread" ON public.chat_threads
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own thread" ON public.chat_threads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own thread" ON public.chat_threads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete threads" ON public.chat_threads
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Messages: same access via thread ownership
CREATE POLICY "View thread messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'admin') OR
    EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Send thread messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND (
      has_role(auth.uid(), 'admin') OR
      EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
    )
  );
CREATE POLICY "Admins delete messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;
