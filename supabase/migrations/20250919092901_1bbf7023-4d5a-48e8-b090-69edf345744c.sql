-- Create default organisation
INSERT INTO public.organisations (id, nom) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Organisation Principale')
ON CONFLICT (id) DO NOTHING;

-- Create trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (user_id, nom, organisation_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nom', NEW.email), 
    '00000000-0000-0000-0000-000000000001'
  );
  
  -- Assign default role (personnel) unless it's the admin
  INSERT INTO public.user_roles (user_id, role, organisation_id)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'ninopaket@gmail.com' THEN 'admin'::app_role
      ELSE 'personnel'::app_role
    END,
    '00000000-0000-0000-0000-000000000001'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();