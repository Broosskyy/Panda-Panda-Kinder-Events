-- Public website: extended service fields for detail modals
alter table cms_services add column if not exists detail_text text default '';
alter table cms_services add column if not exists image_url text default '';
alter table cms_services add column if not exists button_label text default 'Mehr erfahren';
