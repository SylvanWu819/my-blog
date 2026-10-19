-- 在 Supabase Dashboard → SQL Editor 中执行。
-- 执行前先在 Authentication → Users 创建你的账号，并关闭公开注册。

-- 文章只允许已登录用户访问。服务端 RLS 才是真正的安全边界。
alter table public.posts enable row level security;
revoke all on table public.posts from anon;
grant select, insert, update on table public.posts to authenticated;

drop policy if exists "authenticated users can read posts" on public.posts;
drop policy if exists "authenticated users can create posts" on public.posts;
drop policy if exists "authenticated users can update posts" on public.posts;

create policy "authenticated users can read posts"
on public.posts for select
to authenticated
using (true);

create policy "authenticated users can create posts"
on public.posts for insert
to authenticated
with check (true);

create policy "authenticated users can update posts"
on public.posts for update
to authenticated
using (true)
with check (true);

-- post-images 存储桶同样只允许已登录用户读取和写入。
update storage.buckets
set public = false
where id = 'post-images';

-- 如果此前给 storage.objects 创建过其他允许 anon/public 访问 post-images
-- 的策略，请先在 Dashboard → Storage → Policies 中删除它们。
drop policy if exists "authenticated users can read post images" on storage.objects;
drop policy if exists "authenticated users can upload post images" on storage.objects;

create policy "authenticated users can read post images"
on storage.objects for select
to authenticated
using (bucket_id = 'post-images');

create policy "authenticated users can upload post images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'post-images');
