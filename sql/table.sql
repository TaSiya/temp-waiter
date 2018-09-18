drop table waiters, weekdays, shifts;

create table waiters(
    id serial primary key not null,
    first_name text not null,
    passcode int not null
);
alter sequence waiters_id_seq restart 1;
create table weekdays(
    id serial primary key not null,
    day text not null,
    status text,
    box text
);
alter SEQUENCE weekdays_id_seq restart 1;
create table shifts (
    id serial primary key not null,
    waiter_id int not null,
    weekday_id int not null,
    FOREIGN key (waiter_id) REFERENCES waiters(id),
    FOREIGN KEY (weekday_id) REFERENCES weekdays(id)
);

\i sql/insertEmployees.sql;