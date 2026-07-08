-- CMS services: category + button link for admin editing

alter table cms_services add column if not exists category text not null default '';
alter table cms_services add column if not exists button_link text not null default '';

create unique index if not exists cms_services_title_unique_idx on cms_services (lower(title));
