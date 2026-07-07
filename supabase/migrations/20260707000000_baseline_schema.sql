-- Baseline schema for BIFL Products (buyitforlifeproducts.com).
-- Generated 2026-07-07 via `supabase db dump` against the live production
-- database. This is the single source of truth for a fresh environment;
-- the pre-baseline piecemeal migrations live in supabase/migrations-archive/
-- (already applied to production, kept for history only).

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'BIFL Products Database - Optimized for Buy It For Life product catalog with comprehensive taxonomy and review system';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_bifl_score"("dur_score" integer, "rep_score" integer, "sus_score" integer, "soc_score" integer, "war_score" integer) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Weighted average: durability and repairability are most important
  RETURN ROUND(
    (dur_score * 0.3 + rep_score * 0.25 + sus_score * 0.2 + soc_score * 0.15 + war_score * 0.1),
    1
  );
END;
$$;


ALTER FUNCTION "public"."calculate_bifl_score"("dur_score" integer, "rep_score" integer, "sus_score" integer, "soc_score" integer, "war_score" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_bifl_score"("dur_score" numeric, "rep_score" numeric, "sus_score" numeric, "soc_score" numeric, "war_score" numeric) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Weighted average: durability and repairability are most important
  RETURN ROUND(
    (dur_score * 0.3 + rep_score * 0.25 + sus_score * 0.2 + soc_score * 0.15 + war_score * 0.1),
    1
  );
END;
$$;


ALTER FUNCTION "public"."calculate_bifl_score"("dur_score" numeric, "rep_score" numeric, "sus_score" numeric, "soc_score" numeric, "war_score" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_curations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_curations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_feedback_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_feedback_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE products
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(overall_rating::DECIMAL), 1), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_product_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tag_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_tag_usage"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account" (
    "id" "text" NOT NULL,
    "accountId" "text" NOT NULL,
    "providerId" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "accessToken" "text",
    "refreshToken" "text",
    "idToken" "text",
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    "scope" "text",
    "password" "text",
    "createdAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" "text" NOT NULL,
    "name" character varying(255) DEFAULT 'Admin User'::character varying,
    "role" character varying(50) DEFAULT 'admin'::character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login" timestamp with time zone
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "icon_name" character varying(255) NOT NULL,
    "background_color" character varying(7) NOT NULL,
    "text_color" character varying(7) DEFAULT '#FFFFFF'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "website" character varying(500),
    "description" "text",
    "country" character varying(100),
    "founded_year" integer,
    "warranty_info" "text",
    "reputation_score" integer,
    "logo_url" character varying(500),
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "brands_reputation_score_check" CHECK ((("reputation_score" >= 1) AND ("reputation_score" <= 10)))
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buying_guides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" character varying(255) NOT NULL,
    "title" character varying(500) NOT NULL,
    "meta_title" character varying(255),
    "meta_description" "text",
    "intro_content" "text",
    "buying_criteria" "jsonb" DEFAULT '[]'::"jsonb",
    "featured_image_url" "text",
    "curation_id" "uuid",
    "category_id" "uuid",
    "faqs" "jsonb" DEFAULT '[]'::"jsonb",
    "is_published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."buying_guides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "parent_id" "uuid",
    "description" "text",
    "icon_url" character varying(500),
    "display_order" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "show_buying_guide" boolean DEFAULT false
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."categories"."parent_id" IS 'Reference to parent category for hierarchical structure. NULL for top-level categories.';



CREATE TABLE IF NOT EXISTS "public"."certifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "icon_url" character varying(500),
    "issuing_body" character varying(255),
    "criteria" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."curation_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "curation_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."curation_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."curations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "featured_image_url" "text",
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."curations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."materials" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "sustainability_rating" integer,
    "durability_factor" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "materials_sustainability_rating_check" CHECK ((("sustainability_rating" >= 1) AND ("sustainability_rating" <= 10)))
);


ALTER TABLE "public"."materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_ranges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "slug" character varying(50) NOT NULL,
    "min_price" numeric(10,2),
    "max_price" numeric(10,2),
    "description" "text",
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."price_ranges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "description" "text",
    "excerpt" "text",
    "brand_id" "uuid",
    "category_id" "uuid",
    "primary_material_id" "uuid",
    "price_range_id" "uuid",
    "durability_score" numeric(3,1),
    "repairability_score" numeric(3,1),
    "sustainability_score" numeric(3,1),
    "social_score" numeric(3,1),
    "warranty_score" numeric(3,1),
    "bifl_total_score" numeric(3,1),
    "star_rating" numeric(2,1),
    "price" numeric(10,2),
    "dimensions" character varying(200),
    "weight" character varying(100),
    "lifespan_expectation" integer,
    "warranty_years" numeric(4,1),
    "featured_image_url" character varying(500),
    "gallery_images" "jsonb" DEFAULT '[]'::"jsonb",
    "affiliate_link" "text",
    "manufacturer_link" "text",
    "pros" "jsonb" DEFAULT '[]'::"jsonb",
    "cons" "jsonb" DEFAULT '[]'::"jsonb",
    "key_features" "jsonb" DEFAULT '[]'::"jsonb",
    "verdict_summary" "text",
    "verdict_bullets" "jsonb" DEFAULT '[]'::"jsonb",
    "durability_notes" "text",
    "repairability_notes" "text",
    "sustainability_notes" "text",
    "social_notes" "text",
    "warranty_notes" "text",
    "general_notes" "text",
    "country_of_origin" character varying(100),
    "use_case" character varying(255),
    "wordpress_id" integer,
    "wordpress_meta" "jsonb" DEFAULT '{}'::"jsonb",
    "is_featured" boolean DEFAULT false,
    "status" character varying(50) DEFAULT 'published'::character varying,
    "view_count" integer DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "average_rating" numeric(2,1) DEFAULT 0,
    "meta_title" character varying(255),
    "meta_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "optimized_product_description" "text",
    "bifl_certification" character varying(255),
    "care_and_maintenance" "jsonb",
    "pros_cons" "jsonb",
    "manufacturing_notes" "text",
    "faq_1_q" "text",
    "faq_1_a" "text",
    "faq_2_q" "text",
    "faq_2_a" "text",
    "faq_3_q" "text",
    "faq_3_a" "text",
    "faq_4_q" "text",
    "faq_4_a" "text",
    "faq_5_q" "text",
    "faq_5_a" "text",
    "pro_1" "text",
    "pro_2" "text",
    "pro_3" "text",
    "pro_4" "text",
    "con_1" "text",
    "con_2" "text",
    "con_3" "text",
    "con_4" "text",
    CONSTRAINT "products_bifl_total_score_check" CHECK ((("bifl_total_score" >= 1.0) AND ("bifl_total_score" <= 10.0))),
    CONSTRAINT "products_durability_score_check" CHECK ((("durability_score" >= 1.0) AND ("durability_score" <= 10.0))),
    CONSTRAINT "products_repairability_score_check" CHECK ((("repairability_score" >= 1.0) AND ("repairability_score" <= 10.0))),
    CONSTRAINT "products_social_score_check" CHECK ((("social_score" >= 1.0) AND ("social_score" <= 10.0))),
    CONSTRAINT "products_star_rating_check" CHECK ((("star_rating" >= 1.0) AND ("star_rating" <= 5.0))),
    CONSTRAINT "products_sustainability_score_check" CHECK ((("sustainability_score" >= 1.0) AND ("sustainability_score" <= 10.0))),
    CONSTRAINT "products_warranty_score_check" CHECK ((("warranty_score" >= 1.0) AND ("warranty_score" <= 10.0)))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."optimized_product_description" IS 'AI-generated BIFL-focused product description (40-60 words)';



COMMENT ON COLUMN "public"."products"."bifl_certification" IS 'Array of BIFL badges/certifications for the product';



COMMENT ON COLUMN "public"."products"."care_and_maintenance" IS 'JSONB structure with frequency and steps for product care guide';



COMMENT ON COLUMN "public"."products"."manufacturing_notes" IS 'Additional context about manufacturing location';



CREATE OR REPLACE VIEW "public"."featured_products" AS
 SELECT "p"."id",
    "p"."name",
    "p"."slug",
    "p"."featured_image_url",
    "p"."bifl_total_score",
    "p"."created_at",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "c"."name" AS "category_name",
    "c"."slug" AS "category_slug",
    "m"."name" AS "material_name",
    "pr"."name" AS "price_range_name"
   FROM (((("public"."products" "p"
     LEFT JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     LEFT JOIN "public"."categories" "c" ON (("p"."category_id" = "c"."id")))
     LEFT JOIN "public"."materials" "m" ON (("p"."primary_material_id" = "m"."id")))
     LEFT JOIN "public"."price_ranges" "pr" ON (("p"."price_range_id" = "pr"."id")))
  WHERE (("p"."is_featured" = true) AND (("p"."status")::"text" = 'published'::"text"));


ALTER VIEW "public"."featured_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feedback_type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "details" "text" NOT NULL,
    "attachment_url" "text",
    "contact_name" "text",
    "contact_email" "text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "feedback_feedback_type_check" CHECK (("feedback_type" = ANY (ARRAY['website_bug'::"text", 'product_suggestion'::"text", 'data_correction'::"text", 'general_idea'::"text"]))),
    CONSTRAINT "feedback_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'in_review'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."feedback" IS 'Stores user feedback submissions';



CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "subscribed" boolean DEFAULT true,
    "subscribed_at" timestamp with time zone DEFAULT "now"(),
    "unsubscribed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


COMMENT ON TABLE "public"."newsletter_subscribers" IS 'Stores email addresses for newsletter subscriptions';



CREATE TABLE IF NOT EXISTS "public"."product_certifications" (
    "product_id" "uuid" NOT NULL,
    "certification_id" "uuid" NOT NULL,
    "certified_date" "date",
    "expiry_date" "date"
);


ALTER TABLE "public"."product_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_materials" (
    "product_id" "uuid" NOT NULL,
    "material_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "percentage" numeric(5,2)
);


ALTER TABLE "public"."product_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_tags" (
    "product_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."product_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "vendor_id" "uuid",
    "product_url" character varying(500),
    "current_price" numeric(10,2),
    "is_available" boolean DEFAULT true,
    "last_checked" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "category" character varying(50),
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."products_with_taxonomy" AS
 SELECT "p"."id",
    "p"."name",
    "p"."slug",
    "p"."description",
    "p"."excerpt",
    "p"."featured_image_url",
    "p"."price",
    "p"."durability_score",
    "p"."repairability_score",
    "p"."warranty_score",
    "p"."sustainability_score",
    "p"."social_score",
    "p"."bifl_total_score",
    "p"."lifespan_expectation",
    "p"."status",
    "p"."created_at",
    "p"."category_id",
    "p"."brand_id",
    "p"."price_range_id",
    "p"."country_of_origin",
    "p"."bifl_certification",
    "p"."affiliate_link",
    "p"."use_case",
    "p"."is_featured",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "c"."name" AS "category_name",
    "c"."slug" AS "category_slug",
    "m"."name" AS "material_name",
    "pr"."name" AS "price_range_name",
    ARRAY( SELECT "t"."name"
           FROM ("public"."tags" "t"
             JOIN "public"."product_tags" "pt" ON (("t"."id" = "pt"."tag_id")))
          WHERE ("pt"."product_id" = "p"."id")) AS "tag_names",
    ARRAY( SELECT "cert"."name"
           FROM ("public"."certifications" "cert"
             JOIN "public"."product_certifications" "pc" ON (("cert"."id" = "pc"."certification_id")))
          WHERE ("pc"."product_id" = "p"."id")) AS "certification_names"
   FROM (((("public"."products" "p"
     LEFT JOIN "public"."brands" "b" ON (("p"."brand_id" = "b"."id")))
     LEFT JOIN "public"."categories" "c" ON (("p"."category_id" = "c"."id")))
     LEFT JOIN "public"."materials" "m" ON (("p"."primary_material_id" = "m"."id")))
     LEFT JOIN "public"."price_ranges" "pr" ON (("p"."price_range_id" = "pr"."id")));


ALTER VIEW "public"."products_with_taxonomy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "user_email" character varying(255) NOT NULL,
    "user_name" character varying(255),
    "overall_rating" numeric(3,1) NOT NULL,
    "durability_rating" numeric(3,1),
    "value_rating" integer,
    "title" character varying(255),
    "content" "text",
    "pros" "jsonb" DEFAULT '[]'::"jsonb",
    "cons" "jsonb" DEFAULT '[]'::"jsonb",
    "years_owned" numeric(4,1),
    "still_works" boolean DEFAULT true,
    "would_buy_again" boolean,
    "verified_purchase" boolean DEFAULT false,
    "images" "jsonb" DEFAULT '[]'::"jsonb",
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "helpful_count" integer DEFAULT 0,
    "reported_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "repairability_rating" numeric(3,1),
    "warranty_rating" numeric(3,1),
    "social_rating" numeric(3,1),
    CONSTRAINT "durability_rating_increment_check" CHECK ((("durability_rating" IS NULL) OR (("durability_rating" * (2)::numeric) = "round"(("durability_rating" * (2)::numeric))))),
    CONSTRAINT "overall_rating_increment_check" CHECK ((("overall_rating" * (2)::numeric) = "round"(("overall_rating" * (2)::numeric)))),
    CONSTRAINT "repairability_rating_increment_check" CHECK ((("repairability_rating" IS NULL) OR (("repairability_rating" * (2)::numeric) = "round"(("repairability_rating" * (2)::numeric))))),
    CONSTRAINT "reviews_durability_rating_check" CHECK ((("durability_rating" >= (1)::numeric) AND ("durability_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_overall_rating_check" CHECK ((("overall_rating" >= (1)::numeric) AND ("overall_rating" <= (5)::numeric))),
    CONSTRAINT "reviews_repairability_rating_check" CHECK ((("repairability_rating" >= 0.0) AND ("repairability_rating" <= 10.0))),
    CONSTRAINT "reviews_social_rating_check" CHECK ((("social_rating" >= 0.0) AND ("social_rating" <= 10.0))),
    CONSTRAINT "reviews_value_rating_check" CHECK ((("value_rating" >= 1) AND ("value_rating" <= 5))),
    CONSTRAINT "reviews_warranty_rating_check" CHECK ((("warranty_rating" >= 0.0) AND ("warranty_rating" <= 10.0))),
    CONSTRAINT "social_rating_increment_check" CHECK ((("social_rating" IS NULL) OR (("social_rating" * (2)::numeric) = "round"(("social_rating" * (2)::numeric))))),
    CONSTRAINT "warranty_rating_increment_check" CHECK ((("warranty_rating" IS NULL) OR (("warranty_rating" * (2)::numeric) = "round"(("warranty_rating" * (2)::numeric)))))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session" (
    "id" "text" NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "token" "text" NOT NULL,
    "createdAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "ipAddress" "text",
    "userAgent" "text",
    "userId" "text" NOT NULL
);


ALTER TABLE "public"."session" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "image" "text",
    "createdAt" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_recently_viewed" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_recently_viewed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "website" character varying(500),
    "affiliate_program" boolean DEFAULT false,
    "commission_rate" numeric(5,2),
    "shipping_info" "text",
    "return_policy" "text",
    "reputation_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendors_reputation_score_check" CHECK ((("reputation_score" >= 1) AND ("reputation_score" <= 10)))
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification" (
    "id" "text" NOT NULL,
    "identifier" "text" NOT NULL,
    "value" "text" NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT "now"(),
    "updatedAt" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."verification" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."buying_guides"
    ADD CONSTRAINT "buying_guides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."buying_guides"
    ADD CONSTRAINT "buying_guides_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certifications"
    ADD CONSTRAINT "certifications_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."curation_products"
    ADD CONSTRAINT "curation_products_curation_id_product_id_key" UNIQUE ("curation_id", "product_id");



ALTER TABLE ONLY "public"."curation_products"
    ADD CONSTRAINT "curation_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."curations"
    ADD CONSTRAINT "curations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."curations"
    ADD CONSTRAINT "curations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."materials"
    ADD CONSTRAINT "materials_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_ranges"
    ADD CONSTRAINT "price_ranges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."price_ranges"
    ADD CONSTRAINT "price_ranges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_ranges"
    ADD CONSTRAINT "price_ranges_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."product_certifications"
    ADD CONSTRAINT "product_certifications_pkey" PRIMARY KEY ("product_id", "certification_id");



ALTER TABLE ONLY "public"."product_faqs"
    ADD CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_materials"
    ADD CONSTRAINT "product_materials_pkey" PRIMARY KEY ("product_id", "material_id");



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id", "tag_id");



ALTER TABLE ONLY "public"."product_vendors"
    ADD CONSTRAINT "product_vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_email_product_id_key" UNIQUE ("user_email", "product_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_recently_viewed"
    ADD CONSTRAINT "user_recently_viewed_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_recently_viewed"
    ADD CONSTRAINT "user_recently_viewed_user_email_product_id_key" UNIQUE ("user_email", "product_id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."verification"
    ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");



CREATE INDEX "account_userId_idx" ON "public"."account" USING "btree" ("userId");



CREATE INDEX "idx_admin_users_active" ON "public"."admin_users" USING "btree" ("is_active");



CREATE INDEX "idx_admin_users_email" ON "public"."admin_users" USING "btree" ("email");



CREATE INDEX "idx_buying_guides_curation" ON "public"."buying_guides" USING "btree" ("curation_id");



CREATE INDEX "idx_buying_guides_published" ON "public"."buying_guides" USING "btree" ("is_published");



CREATE INDEX "idx_buying_guides_slug" ON "public"."buying_guides" USING "btree" ("slug");



CREATE INDEX "idx_curation_products_curation_id" ON "public"."curation_products" USING "btree" ("curation_id");



CREATE INDEX "idx_curation_products_product_id" ON "public"."curation_products" USING "btree" ("product_id");



CREATE INDEX "idx_curations_display_order" ON "public"."curations" USING "btree" ("display_order");



CREATE INDEX "idx_curations_is_active" ON "public"."curations" USING "btree" ("is_active");



CREATE INDEX "idx_curations_is_featured" ON "public"."curations" USING "btree" ("is_featured");



CREATE INDEX "idx_curations_slug" ON "public"."curations" USING "btree" ("slug");



CREATE INDEX "idx_feedback_created_at" ON "public"."feedback" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_feedback_status" ON "public"."feedback" USING "btree" ("status");



CREATE INDEX "idx_feedback_type" ON "public"."feedback" USING "btree" ("feedback_type");



CREATE INDEX "idx_newsletter_subscribers_email" ON "public"."newsletter_subscribers" USING "btree" ("email");



CREATE INDEX "idx_newsletter_subscribers_subscribed" ON "public"."newsletter_subscribers" USING "btree" ("subscribed");



CREATE INDEX "idx_product_certifications_product" ON "public"."product_certifications" USING "btree" ("product_id");



CREATE INDEX "idx_product_faqs_product_id" ON "public"."product_faqs" USING "btree" ("product_id");



CREATE INDEX "idx_product_materials_product" ON "public"."product_materials" USING "btree" ("product_id");



CREATE INDEX "idx_product_tags_product" ON "public"."product_tags" USING "btree" ("product_id");



CREATE INDEX "idx_product_tags_tag" ON "public"."product_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_products_bifl_certification" ON "public"."products" USING "btree" ("bifl_certification");



CREATE INDEX "idx_products_bifl_score" ON "public"."products" USING "btree" ("bifl_total_score");



CREATE INDEX "idx_products_brand" ON "public"."products" USING "btree" ("brand_id");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_created" ON "public"."products" USING "btree" ("created_at");



CREATE INDEX "idx_products_durability" ON "public"."products" USING "btree" ("durability_score");



CREATE INDEX "idx_products_featured" ON "public"."products" USING "btree" ("is_featured");



CREATE INDEX "idx_products_material" ON "public"."products" USING "btree" ("primary_material_id");



CREATE INDEX "idx_products_price_range" ON "public"."products" USING "btree" ("price_range_id");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("status");



CREATE INDEX "idx_reviews_created" ON "public"."reviews" USING "btree" ("created_at");



CREATE INDEX "idx_reviews_product" ON "public"."reviews" USING "btree" ("product_id");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("overall_rating");



CREATE INDEX "idx_reviews_status" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "idx_tags_category" ON "public"."tags" USING "btree" ("category");



CREATE INDEX "idx_tags_usage" ON "public"."tags" USING "btree" ("usage_count");



CREATE INDEX "idx_user_favorites_product_id" ON "public"."user_favorites" USING "btree" ("product_id");



CREATE INDEX "idx_user_favorites_user_email" ON "public"."user_favorites" USING "btree" ("user_email");



CREATE INDEX "idx_user_recently_viewed_user_email" ON "public"."user_recently_viewed" USING "btree" ("user_email");



CREATE INDEX "idx_user_recently_viewed_viewed_at" ON "public"."user_recently_viewed" USING "btree" ("viewed_at");



CREATE INDEX "session_userId_idx" ON "public"."session" USING "btree" ("userId");



CREATE INDEX "user_email_idx" ON "public"."user" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "curations_updated_at" BEFORE UPDATE ON "public"."curations" FOR EACH ROW EXECUTE FUNCTION "public"."update_curations_updated_at"();



CREATE OR REPLACE TRIGGER "feedback_updated_at" BEFORE UPDATE ON "public"."feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_feedback_updated_at"();



CREATE OR REPLACE TRIGGER "update_product_rating_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_rating"();



CREATE OR REPLACE TRIGGER "update_tag_usage_trigger" AFTER INSERT OR DELETE ON "public"."product_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage"();



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."buying_guides"
    ADD CONSTRAINT "buying_guides_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."buying_guides"
    ADD CONSTRAINT "buying_guides_curation_id_fkey" FOREIGN KEY ("curation_id") REFERENCES "public"."curations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."curation_products"
    ADD CONSTRAINT "curation_products_curation_id_fkey" FOREIGN KEY ("curation_id") REFERENCES "public"."curations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."curation_products"
    ADD CONSTRAINT "curation_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_certifications"
    ADD CONSTRAINT "product_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_certifications"
    ADD CONSTRAINT "product_certifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_faqs"
    ADD CONSTRAINT "product_faqs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_materials"
    ADD CONSTRAINT "product_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_materials"
    ADD CONSTRAINT "product_materials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_vendors"
    ADD CONSTRAINT "product_vendors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_vendors"
    ADD CONSTRAINT "product_vendors_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_price_range_id_fkey" FOREIGN KEY ("price_range_id") REFERENCES "public"."price_ranges"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_primary_material_id_fkey" FOREIGN KEY ("primary_material_id") REFERENCES "public"."materials"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_recently_viewed"
    ADD CONSTRAINT "user_recently_viewed_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can submit feedback" ON "public"."feedback" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Public can view active curations" ON "public"."curations" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view approved reviews" ON "public"."reviews" FOR SELECT USING ((("status")::"text" = 'approved'::"text"));



CREATE POLICY "Public can view categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public can view certifications" ON "public"."certifications" FOR SELECT USING (true);



CREATE POLICY "Public can view curation products" ON "public"."curation_products" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."curations"
  WHERE (("curations"."id" = "curation_products"."curation_id") AND ("curations"."is_active" = true)))));



CREATE POLICY "Public can view materials" ON "public"."materials" FOR SELECT USING (true);



CREATE POLICY "Public can view published guides" ON "public"."buying_guides" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can view published products" ON "public"."products" FOR SELECT USING ((("status")::"text" = 'published'::"text"));



CREATE POLICY "Public can view tags" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Public can view taxonomies" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Public can view vendors" ON "public"."vendors" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."badges" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."price_ranges" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."product_certifications" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."product_faqs" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."product_materials" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."product_tags" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read access" ON "public"."product_vendors" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Service role can manage curation products" ON "public"."curation_products" USING (true);



CREATE POLICY "Service role can manage curations" ON "public"."curations" USING (true);



CREATE POLICY "Service role has full access" ON "public"."buying_guides" USING (true);



CREATE POLICY "Users can view their own feedback" ON "public"."feedback" FOR SELECT TO "authenticated" USING (("contact_email" = "auth"."email"()));



ALTER TABLE "public"."account" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."buying_guides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."curation_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."curations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_ranges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_materials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_recently_viewed" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verification" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" integer, "rep_score" integer, "sus_score" integer, "soc_score" integer, "war_score" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" integer, "rep_score" integer, "sus_score" integer, "soc_score" integer, "war_score" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" integer, "rep_score" integer, "sus_score" integer, "soc_score" integer, "war_score" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" numeric, "rep_score" numeric, "sus_score" numeric, "soc_score" numeric, "war_score" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" numeric, "rep_score" numeric, "sus_score" numeric, "soc_score" numeric, "war_score" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_bifl_score"("dur_score" numeric, "rep_score" numeric, "sus_score" numeric, "soc_score" numeric, "war_score" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_curations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_curations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_curations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_feedback_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tag_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tag_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tag_usage"() TO "service_role";


















GRANT ALL ON TABLE "public"."account" TO "anon";
GRANT ALL ON TABLE "public"."account" TO "authenticated";
GRANT ALL ON TABLE "public"."account" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."buying_guides" TO "anon";
GRANT ALL ON TABLE "public"."buying_guides" TO "authenticated";
GRANT ALL ON TABLE "public"."buying_guides" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."certifications" TO "anon";
GRANT ALL ON TABLE "public"."certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."certifications" TO "service_role";



GRANT ALL ON TABLE "public"."curation_products" TO "anon";
GRANT ALL ON TABLE "public"."curation_products" TO "authenticated";
GRANT ALL ON TABLE "public"."curation_products" TO "service_role";



GRANT ALL ON TABLE "public"."curations" TO "anon";
GRANT ALL ON TABLE "public"."curations" TO "authenticated";
GRANT ALL ON TABLE "public"."curations" TO "service_role";



GRANT ALL ON TABLE "public"."materials" TO "anon";
GRANT ALL ON TABLE "public"."materials" TO "authenticated";
GRANT ALL ON TABLE "public"."materials" TO "service_role";



GRANT ALL ON TABLE "public"."price_ranges" TO "anon";
GRANT ALL ON TABLE "public"."price_ranges" TO "authenticated";
GRANT ALL ON TABLE "public"."price_ranges" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."featured_products" TO "anon";
GRANT ALL ON TABLE "public"."featured_products" TO "authenticated";
GRANT ALL ON TABLE "public"."featured_products" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."product_certifications" TO "anon";
GRANT ALL ON TABLE "public"."product_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."product_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."product_faqs" TO "anon";
GRANT ALL ON TABLE "public"."product_faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."product_faqs" TO "service_role";



GRANT ALL ON TABLE "public"."product_materials" TO "anon";
GRANT ALL ON TABLE "public"."product_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."product_materials" TO "service_role";



GRANT ALL ON TABLE "public"."product_tags" TO "anon";
GRANT ALL ON TABLE "public"."product_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."product_tags" TO "service_role";



GRANT ALL ON TABLE "public"."product_vendors" TO "anon";
GRANT ALL ON TABLE "public"."product_vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."product_vendors" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."products_with_taxonomy" TO "anon";
GRANT ALL ON TABLE "public"."products_with_taxonomy" TO "authenticated";
GRANT ALL ON TABLE "public"."products_with_taxonomy" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."user_recently_viewed" TO "anon";
GRANT ALL ON TABLE "public"."user_recently_viewed" TO "authenticated";
GRANT ALL ON TABLE "public"."user_recently_viewed" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."verification" TO "anon";
GRANT ALL ON TABLE "public"."verification" TO "authenticated";
GRANT ALL ON TABLE "public"."verification" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
