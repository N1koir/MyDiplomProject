CREATE TABLE Role (
    IdRole SERIAL PRIMARY KEY,
    Title TEXT
);

CREATE TABLE Username (
    IdUsername BIGSERIAL PRIMARY KEY,
    DateAddAccount DATE,
    Login VARCHAR(50),
    Password TEXT,
    IdRole INTEGER REFERENCES Role(IdRole) ON DELETE CASCADE
);

CREATE TABLE MonetizationCourse (
    IdMonetizationCourse SERIAL PRIMARY KEY,
    Type VARCHAR(25)
);

CREATE TABLE Category (
    IdCategory SERIAL PRIMARY KEY,
    Type VARCHAR(25)
);

CREATE TABLE LevelKnowledge (
    IdLevelKnowledge SERIAL PRIMARY KEY,
    Type VARCHAR(25)
);

CREATE TABLE AgePeople (
    IdAgePeople SERIAL PRIMARY KEY,
    Type VARCHAR(3)
);

CREATE TABLE Course (
    IdCourse BIGSERIAL PRIMARY KEY,
    Title TEXT,
    Description Text,
    FileIcon BYTEA,
    FileCourse BYTEA,
    Price INTEGER,
    IdUsername BIGINT REFERENCES Username(IdUsername) ON DELETE CASCADE,
    IdMonetizationCourse INTEGER REFERENCES MonetizationCourse(IdMonetizationCourse) ON DELETE CASCADE,
    IdCategory INTEGER REFERENCES Category(IdCategory) ON DELETE CASCADE,
    IdLevelKnowledge INTEGER REFERENCES LevelKnowledge(IdLevelKnowledge) ON DELETE CASCADE,
    IdAgePeople INTEGER REFERENCES AgePeople(IdAgePeople) ON DELETE CASCADE
);