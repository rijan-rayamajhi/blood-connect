-- ============================================================================
-- BloodConnect Auth Storage Migration
-- Creates: org-documents storage bucket with RLS policies
-- ============================================================================

-- Create the org-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-documents', 'org-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to org-documents
CREATE POLICY "authenticated_upload_org_documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'org-documents');

-- Allow users to read their own uploads
CREATE POLICY "owner_read_org_documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'org-documents' AND auth.uid()::text = owner::text);

-- Allow admins to read all org documents
CREATE POLICY "admin_read_all_org_documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'org-documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
