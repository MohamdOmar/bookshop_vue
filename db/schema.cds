using { Currency, cuid, managed, sap } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity Books : managed {
  key ID   : Integer;
  author   : Association to Authors @mandatory;
  title    : localized String @mandatory;
  descr    : localized String;
  genre    : Association to Genres;
  stock    : Integer;
  price    : Price;
  currency : Currency;
}

entity Authors : cuid, managed {
  key ID       : Integer;
  name         : String @mandatory;
  dateOfBirth  : Date;
  dateOfDeath  : Date;
  placeOfBirth : String;
  placeOfDeath : String;
  books        : Association to many Books on books.author = $self;
}

/** Hierarchically organized Code List for Genres */
entity Genres : cuid, sap.common.CodeList {
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}

type Price : Decimal(9,2);
