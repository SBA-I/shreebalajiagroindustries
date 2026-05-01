ALTER TABLE public.contact_inquiries
  ADD CONSTRAINT chk_inquiry_type CHECK (inquiry_type IN ('general','product','distribution','support','complaint')),
  ADD CONSTRAINT chk_name_len CHECK (char_length(name) BETWEEN 1 AND 200),
  ADD CONSTRAINT chk_email_len CHECK (char_length(email) BETWEEN 3 AND 320 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT chk_message_len CHECK (char_length(message) BETWEEN 1 AND 5000);