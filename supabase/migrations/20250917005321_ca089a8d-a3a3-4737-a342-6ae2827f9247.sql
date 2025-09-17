-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'personnel');

-- Create enum for taxpayer status
CREATE TYPE public.taxpayer_status AS ENUM ('en_attente', 'valide', 'rejete');

-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('registre_commerce', 'dfe', 'piece_identite', 'autre');

-- Create organisations table
CREATE TABLE public.organisations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nom TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, organisation_id)
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    contacts TEXT,
    numero_travail TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contribuables table
CREATE TABLE public.contribuables (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    raison_sociale TEXT NOT NULL,
    ville TEXT NOT NULL,
    commune TEXT NOT NULL,
    quartier TEXT,
    nom_gerant TEXT NOT NULL,
    prenom_gerant TEXT NOT NULL,
    rccm TEXT,
    ncc TEXT,
    contact_1 TEXT NOT NULL,
    contact_2 TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    photo_position TEXT,
    commentaire TEXT,
    statut taxpayer_status NOT NULL DEFAULT 'en_attente',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contribuable_id UUID NOT NULL REFERENCES public.contribuables(id) ON DELETE CASCADE,
    type_document document_type NOT NULL,
    nom_fichier TEXT NOT NULL,
    chemin_fichier TEXT NOT NULL,
    taille_fichier INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deletion_requests table for personnel deletion requests
CREATE TABLE public.deletion_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contribuable_id UUID NOT NULL REFERENCES public.contribuables(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID, org_uuid UUID)
RETURNS app_role AS $$
    SELECT role FROM public.user_roles 
    WHERE user_id = user_uuid AND organisation_id = org_uuid
    LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to get user organisation
CREATE OR REPLACE FUNCTION public.get_user_organisation(user_uuid UUID)
RETURNS UUID AS $$
    SELECT organisation_id FROM public.profiles 
    WHERE user_id = user_uuid
    LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for organisations
CREATE POLICY "Users can view their organisation" ON public.organisations
    FOR SELECT USING (id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Admins can update their organisation" ON public.organisations
    FOR UPDATE USING (
        id = public.get_user_organisation(auth.uid()) AND 
        public.get_user_role(auth.uid(), id) = 'admin'
    );

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their organisation" ON public.user_roles
    FOR SELECT USING (organisation_id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Admins can manage roles in their organisation" ON public.user_roles
    FOR ALL USING (
        organisation_id = public.get_user_organisation(auth.uid()) AND 
        public.get_user_role(auth.uid(), organisation_id) = 'admin'
    );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organisation" ON public.profiles
    FOR SELECT USING (organisation_id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organisation" ON public.profiles
    FOR ALL USING (
        organisation_id = public.get_user_organisation(auth.uid()) AND 
        public.get_user_role(auth.uid(), organisation_id) = 'admin'
    );

-- RLS Policies for contribuables
CREATE POLICY "Users can view contribuables in their organisation" ON public.contribuables
    FOR SELECT USING (organisation_id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Authenticated users can create contribuables in their organisation" ON public.contribuables
    FOR INSERT WITH CHECK (organisation_id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Personnel and admins can update contribuables in their organisation" ON public.contribuables
    FOR UPDATE USING (organisation_id = public.get_user_organisation(auth.uid()));

CREATE POLICY "Admins can delete contribuables in their organisation" ON public.contribuables
    FOR DELETE USING (
        organisation_id = public.get_user_organisation(auth.uid()) AND 
        public.get_user_role(auth.uid(), organisation_id) = 'admin'
    );

-- Public policy for contribuables (for public registration form)
CREATE POLICY "Anyone can create contribuables" ON public.contribuables
    FOR INSERT WITH CHECK (true);

-- RLS Policies for documents
CREATE POLICY "Users can view documents of contribuables in their organisation" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contribuables c 
            WHERE c.id = documents.contribuable_id 
            AND c.organisation_id = public.get_user_organisation(auth.uid())
        )
    );

CREATE POLICY "Users can create documents for contribuables in their organisation" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contribuables c 
            WHERE c.id = documents.contribuable_id 
            AND c.organisation_id = public.get_user_organisation(auth.uid())
        )
    );

-- RLS Policies for deletion_requests
CREATE POLICY "Users can view deletion requests in their organisation" ON public.deletion_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contribuables c 
            WHERE c.id = deletion_requests.contribuable_id 
            AND c.organisation_id = public.get_user_organisation(auth.uid())
        )
    );

CREATE POLICY "Personnel can create deletion requests" ON public.deletion_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.contribuables c 
            WHERE c.id = deletion_requests.contribuable_id 
            AND c.organisation_id = public.get_user_organisation(auth.uid())
        )
    );

CREATE POLICY "Admins can update deletion requests" ON public.deletion_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contribuables c 
            WHERE c.id = deletion_requests.contribuable_id 
            AND c.organisation_id = public.get_user_organisation(auth.uid())
            AND public.get_user_role(auth.uid(), c.organisation_id) = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organisations_updated_at
    BEFORE UPDATE ON public.organisations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contribuables_updated_at
    BEFORE UPDATE ON public.contribuables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_organisation_id ON public.user_roles(organisation_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_organisation_id ON public.profiles(organisation_id);
CREATE INDEX idx_contribuables_organisation_id ON public.contribuables(organisation_id);
CREATE INDEX idx_contribuables_statut ON public.contribuables(statut);
CREATE INDEX idx_documents_contribuable_id ON public.documents(contribuable_id);
CREATE INDEX idx_deletion_requests_contribuable_id ON public.deletion_requests(contribuable_id);