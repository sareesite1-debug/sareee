
DROP POLICY "Anyone can submit messages" ON public.messages;
CREATE POLICY "Anyone can submit messages" ON public.messages FOR INSERT TO anon WITH CHECK (is_read = false);
