-- ============================================================================
-- BloodConnect Prescriptions Bucket Migration
-- Creates storage bucket for prescriptions
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for prescriptions bucket
-- Note: Requires checking organization_id of the user creating the request. Since hospital uploads the prescription.
CREATE POLICY "Hospitals can upload prescriptions" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'prescriptions' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'hospital')
);

CREATE POLICY "Anyone can view prescriptions" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'prescriptions');

CREATE POLICY "Admins can manage prescriptions" 
ON storage.objects FOR ALL TO authenticated 
USING (
  bucket_id = 'prescriptions' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'prescriptions' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
