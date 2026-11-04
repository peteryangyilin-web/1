-- Run only in the Supabase SQL Editor, after signing up and verifying your own email in GO.
-- Replace the address below with your email. Do not put this SQL or a private key into a VITE_ variable.
do $$
declare owner_email text := 'REPLACE_WITH_YOUR_VERIFIED_EMAIL'; owner_id uuid;
begin
 if owner_email='REPLACE_WITH_YOUR_VERIFIED_EMAIL' then raise exception 'Replace the example email with your own verified email first';end if;
 select id into owner_id from auth.users where lower(email)=lower(trim(owner_email)) and email_confirmed_at is not null;
 if owner_id is null then raise exception 'No verified account found. Create and verify this email account in GO first.';end if;
 insert into go_private.admin_users(user_id) values(owner_id) on conflict(user_id) do nothing;
end $$;
