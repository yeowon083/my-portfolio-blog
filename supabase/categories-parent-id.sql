alter table public.categories
  add column if not exists parent_id uuid null references public.categories(id) on delete set null;

create index if not exists categories_parent_id_idx
  on public.categories(parent_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_parent_not_self'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_parent_not_self
      check (parent_id is null or parent_id <> id);
  end if;
end $$;

create or replace function public.ensure_category_parent_depth()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if exists (
    select 1
    from public.categories parent
    where parent.id = new.parent_id
      and parent.parent_id is not null
  ) then
    raise exception 'A category can only be nested one level deep.';
  end if;

  if exists (
    select 1
    from public.categories child
    where child.parent_id = new.id
  ) then
    raise exception 'A category with children cannot become a subcategory.';
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_category_parent_depth on public.categories;

create trigger ensure_category_parent_depth
before insert or update of parent_id on public.categories
for each row
execute function public.ensure_category_parent_depth();
