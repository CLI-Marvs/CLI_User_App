-- Add due_date column to work_order_groups table
ALTER TABLE public.work_order_groups 
ADD COLUMN IF NOT EXISTS due_date date;

-- Add index for better performance on due date queries
CREATE INDEX IF NOT EXISTS idx_work_order_groups_due_date ON public.work_order_groups(due_date);

-- Add comment to the column
COMMENT ON COLUMN public.work_order_groups.due_date IS 'Due date for the work order group, typically set to the earliest deadline of work orders in the group';
