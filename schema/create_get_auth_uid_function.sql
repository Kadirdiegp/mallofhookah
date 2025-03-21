-- Erstellt eine SQL-Funktion, um auth.uid() in der Client-Anwendung zu verwenden

-- Erstelle die Funktion
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Gewähre Ausführungsberechtigungen für alle authentifizierten Benutzer
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated;
