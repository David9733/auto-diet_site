-- Create store_settings table
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT '우리 매장',
  meals_per_day INTEGER NOT NULL DEFAULT 3 CHECK (meals_per_day BETWEEN 1 AND 3),
  days_per_week INTEGER NOT NULL DEFAULT 5 CHECK (days_per_week BETWEEN 1 AND 7),
  side_dish_count INTEGER NOT NULL DEFAULT 4,
  serving_count INTEGER NOT NULL DEFAULT 100,
  budget_per_meal INTEGER NOT NULL DEFAULT 7000,
  cost_ratio INTEGER NOT NULL DEFAULT 35,
  snack_morning BOOLEAN NOT NULL DEFAULT false,
  snack_afternoon BOOLEAN NOT NULL DEFAULT false,
  snack_evening BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  settings_id UUID REFERENCES public.store_settings(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for now, before auth is added)
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert store_settings" ON public.store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update store_settings" ON public.store_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete store_settings" ON public.store_settings FOR DELETE USING (true);

CREATE POLICY "Allow public read meal_plans" ON public.meal_plans FOR SELECT USING (true);
CREATE POLICY "Allow public insert meal_plans" ON public.meal_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update meal_plans" ON public.meal_plans FOR UPDATE USING (true);
CREATE POLICY "Allow public delete meal_plans" ON public.meal_plans FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();