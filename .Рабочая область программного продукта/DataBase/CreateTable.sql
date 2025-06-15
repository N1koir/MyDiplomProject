CREATE TABLE role (
    idrole SERIAL PRIMARY KEY
    , title TEXT
);

CREATE TABLE username (
    idusername BIGSERIAL PRIMARY KEY
    , login VARCHAR(50)
    , password TEXT
    , dateaddaccount DATE
    , idrole INTEGER REFERENCES role(idrole) ON DELETE CASCADE
);

CREATE TABLE monetizationcourse (
    idmonetizationcourse SERIAL PRIMARY KEY
    , type VARCHAR(25)
);

CREATE TABLE levelknowledge (
    idlevelknowledge SERIAL PRIMARY KEY
    , type VARCHAR(25)
);

CREATE TABLE category (
    idcategory SERIAL PRIMARY KEY
    , type VARCHAR(25)
);

CREATE TABLE agepeople (
    idagepeople SERIAL PRIMARY KEY
    , type VARCHAR(3)
);

CREATE TABLE course (
    idcourse BIGSERIAL PRIMARY KEY
    , title VARCHAR(100)
    , description TEXT
    , icon BYTEA
    , dateadd DATE
    , idusername BIGINT REFERENCES username(idusername) ON DELETE CASCADE
    , idmonetizationcourse INTEGER REFERENCES monetizationcourse(idmonetizationcourse) ON DELETE CASCADE
    , price INTEGER
    , idlevelknowledge INTEGER REFERENCES levelknowledge(idlevelknowledge) ON DELETE CASCADE
    , idcategory INTEGER REFERENCES category(idcategory) ON DELETE CASCADE
    , idagepeople INTEGER REFERENCES agepeople(idagepeople) ON DELETE CASCADE
);

CREATE TABLE pages (
    idpages BIGSERIAL PRIMARY KEY
    , numberpage INTEGER
    , file BYTEA
    , idcourse BIGINT REFERENCES course(idcourse) ON DELETE CASCADE
);

CREATE TABLE favoritesandhistory (
    idfavoritesandhistory SERIAL PRIMARY KEY
    , viewed INTEGER
    , idcourse BIGINT REFERENCES course(idcourse) ON DELETE CASCADE
    , idusername BIGINT REFERENCES username(idusername) ON DELETE CASCADE
);

CREATE TABLE pay (
    idpay BIGSERIAL PRIMARY KEY
    , idcourse BIGINT REFERENCES course(idcourse) ON DELETE CASCADE
    , idusername BIGINT REFERENCES username(idusername) ON DELETE CASCADE
);

CREATE TABLE typesupport (
    idtypesupport SERIAL PRIMARY KEY
    , type TEXT
);

CREATE TABLE typestatussupport (
    idtypestatussupport SERIAL PRIMARY KEY
    , type VARCHAR(9)
);

CREATE TABLE support (
    idsupport SERIAL PRIMARY KEY
    , idtypesupport INTEGER REFERENCES typesupport(idtypesupport) ON DELETE CASCADE
    , description TEXT
    , idcourse BIGINT REFERENCES course(idcourse) ON DELETE CASCADE
    , idusername BIGINT REFERENCES username(idusername) ON DELETE CASCADE
    , idtypestatussupport INTEGER REFERENCES typestatussupport(idtypestatussupport) ON DELETE CASCADE
)