
BEGIN;


CREATE TABLE IF NOT EXISTS public."User"
(
    "User_id" serial NOT NULL,
    "First_name" character varying(30) NOT NULL,
    "Last_name" character varying(30) NOT NULL,
    "City" character varying(50) NOT NULL,
    "State" character varying(30),
    "Country" character varying(30) NOT NULL,
    "Email" character varying(320) NOT NULL,
    "Username" character varying(30) NOT NULL,
    "Password" character varying(100),
    "UserIcon" character,
    PRIMARY KEY ("User_id")
);

CREATE TABLE IF NOT EXISTS public."Service"
(
    "Service_id" serial,
    "Name" character varying(50) NOT NULL,
    PRIMARY KEY ("Service_id")
);

CREATE TABLE IF NOT EXISTS public."User_service"
(
    "User_id" integer NOT NULL,
    "Service_id" integer NOT NULL,
    PRIMARY KEY ("User_id", "Service_id")
);

CREATE TABLE IF NOT EXISTS public."Message"
(
    "Message_id" serial NOT NULL,
    "Message_content" character NOT NULL,
    "Time " timestamp without time zone,
    "Date" date,
    PRIMARY KEY ("Message_id")
);

CREATE TABLE IF NOT EXISTS public."Message_service"
(
    "Message_id" integer NOT NULL,
    "Service_id" integer NOT NULL,
    "Message_service_id" serial NOT NULL,
    PRIMARY KEY ("Message_service_id")
);

CREATE TABLE IF NOT EXISTS public."Sender"
(
    "Message_service_id" integer NOT NULL,
    "Sender_id" integer NOT NULL,
    "Reciever_id" integer NOT NULL,
    PRIMARY KEY ("Message_service_id")
);

ALTER TABLE IF EXISTS public."User_service"
    ADD CONSTRAINT "User_id" FOREIGN KEY ("User_id")
    REFERENCES public."User" ("User_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."User_service"
    ADD CONSTRAINT "Service_id" FOREIGN KEY ("Service_id")
    REFERENCES public."Service" ("Service_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Message_service"
    ADD CONSTRAINT "Service_id" FOREIGN KEY ("Service_id")
    REFERENCES public."Service" ("Service_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Message_service"
    ADD CONSTRAINT "Message_id" FOREIGN KEY ("Message_id")
    REFERENCES public."Message" ("Message_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Sender"
    ADD CONSTRAINT "Message_service_id" FOREIGN KEY ("Message_service_id")
    REFERENCES public."Message_service" ("Message_service_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Sender"
    ADD CONSTRAINT "Sender_id" FOREIGN KEY ("Sender_id")
    REFERENCES public."User" ("User_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Sender"
    ADD CONSTRAINT "Reciever_id" FOREIGN KEY ("Reciever_id")
    REFERENCES public."User" ("User_id") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;