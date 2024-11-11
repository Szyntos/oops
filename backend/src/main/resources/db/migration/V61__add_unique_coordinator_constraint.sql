create unique index unique_coordinator_role
    on users (role)
    where role = 'coordinator';
