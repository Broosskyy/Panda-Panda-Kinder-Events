-- Review sort order for admin reordering
alter table reviews add column if not exists sort_order integer not null default 0;
create index if not exists idx_reviews_sort on reviews(sort_order, created_at desc);
