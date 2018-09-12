
create table waiters(
    id serial primary key not null,
    first_name text not null,
    passcode int not null
);


create table weekdays(
    id serial primary key not null,
    day text not null

);

create table shifts (
    id serial primary key not null,
    waiter_id int not null,
    weekday_id int not null,
    FOREIGN key (waiter_id) REFERENCES waiters(id),
    FOREIGN KEY (weekday_id) REFERENCES weekdays(id)
);
