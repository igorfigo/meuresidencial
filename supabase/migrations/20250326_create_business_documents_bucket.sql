
-- Create business documents bucket if it doesn't exist
INSERT INTO storage.buckets(id, name, public)
VALUES('business_documents', 'business_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
CREATE POLICY "Allow authenticated users to read business documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'business_documents');

CREATE POLICY "Allow authenticated users to upload business documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business_documents');

CREATE POLICY "Allow authenticated users to update business documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'business_documents');

CREATE POLICY "Allow authenticated users to delete business documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'business_documents');
