namespace sap.capire.bookshop; //> important for reflection, e.g. in cds repl

// Temporary workaround for this situation:
// - Fiori apps in bookstore annotate Books with @fiori.draft.enabled.
// - Because of that .csv data has to eagerly fill in ID_texts column.

using { sap.capire.bookshop.Books } from './schema.cds';
annotate Books with @fiori.draft.enabled;
