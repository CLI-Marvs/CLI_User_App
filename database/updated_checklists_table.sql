-- Updated checklists table structure with requires_document column
CREATE TABLE IF NOT EXISTS public.checklists
(
    id bigint NOT NULL DEFAULT nextval('checklists_id_seq'::regclass),
    submilestone_id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    requires_document boolean NOT NULL DEFAULT false,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT checklists_pkey PRIMARY KEY (id),
    CONSTRAINT checklists_submilestone_id_foreign FOREIGN KEY (submilestone_id)
        REFERENCES public.submilestones (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- The account_checklist_statuses table remains the same
-- This table will track completion status for each account-checklist combination
-- For checklists that require documents, additional document tracking would be handled 
-- through existing uploaded_documents table or a new documents relation
