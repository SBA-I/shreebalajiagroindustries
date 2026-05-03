-- Auto-create profile on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant role when admin approves
DROP TRIGGER IF EXISTS on_profile_verification_change ON public.profiles;
CREATE TRIGGER on_profile_verification_change
  AFTER UPDATE OF verification_status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.grant_role_on_approval();

-- Validate verification_status values
DROP TRIGGER IF EXISTS validate_verification_status_trg ON public.profiles;
CREATE TRIGGER validate_verification_status_trg
  BEFORE INSERT OR UPDATE OF verification_status ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_verification_status();

-- Auto-compute safe harvest date on spray logs
DROP TRIGGER IF EXISTS set_safe_harvest_date_trg ON public.spray_logs;
CREATE TRIGGER set_safe_harvest_date_trg
  BEFORE INSERT OR UPDATE ON public.spray_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_safe_harvest_date();

-- Updated_at triggers for tables that have updated_at columns
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS dealers_updated_at ON public.dealers;
CREATE TRIGGER dealers_updated_at BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS dealer_stock_updated_at ON public.dealer_stock;
CREATE TRIGGER dealer_stock_updated_at BEFORE UPDATE ON public.dealer_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS dealer_invoices_updated_at ON public.dealer_invoices;
CREATE TRIGGER dealer_invoices_updated_at BEFORE UPDATE ON public.dealer_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS dispatches_updated_at ON public.dispatches;
CREATE TRIGGER dispatches_updated_at BEFORE UPDATE ON public.dispatches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS news_articles_updated_at ON public.news_articles;
CREATE TRIGGER news_articles_updated_at BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS sustainability_articles_updated_at ON public.sustainability_articles;
CREATE TRIGGER sustainability_articles_updated_at BEFORE UPDATE ON public.sustainability_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS pest_calendar_updated_at ON public.pest_calendar;
CREATE TRIGGER pest_calendar_updated_at BEFORE UPDATE ON public.pest_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS marketing_assets_updated_at ON public.marketing_assets;
CREATE TRIGGER marketing_assets_updated_at BEFORE UPDATE ON public.marketing_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS msds_documents_updated_at ON public.msds_documents;
CREATE TRIGGER msds_documents_updated_at BEFORE UPDATE ON public.msds_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_subscribers_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();