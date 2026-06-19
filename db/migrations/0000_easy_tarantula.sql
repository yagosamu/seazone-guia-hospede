CREATE TABLE "properties" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"property_type" text NOT NULL,
	"bedroom_quantity" integer NOT NULL,
	"bathroom_quantity" integer NOT NULL,
	"guest_capacity" integer NOT NULL,
	"address" jsonb NOT NULL,
	"operational" jsonb NOT NULL,
	"rules" jsonb NOT NULL,
	"amenities" jsonb NOT NULL,
	"host" jsonb NOT NULL,
	"images" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"experiences_guide" jsonb,
	"experiences_generated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
