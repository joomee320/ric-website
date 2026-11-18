/**
 * Google Apps Script for the content Doc — STUB (docs/decisions.md D4, D12).
 * Implemented in step 6 (docs/progress.md).
 *
 * This file is the source of truth. It is installed by pasting it into the
 * content Doc: Extensions → Apps Script. It runs on Google's servers, not on
 * Vercel. Re-paste it whenever the request format changes.
 *
 * Script Properties (Project Settings → Script Properties), never in this code:
 *   PUBLISH_URL     e.g. https://<preview or production host>/api/publish
 *   PUBLISH_SECRET  same value as PUBLISH_SECRET in Vercel
 *
 * What it does:
 *   - Adds the menu "Website → Publish to website" when the Doc opens.
 *   - On click: POST PUBLISH_URL with header x-publish-secret, no body.
 *   - Shows a popup for the response (docs/spec.md → Publish API, Responses):
 *       200 "Published! The website is now updated."
 *       401 "Something went wrong (401). Please contact the dev team."
 *       422 "Not published. Please fix these:" + the list of issues
 *       502 "Could not read the Doc. Please contact the dev team."
 *       500 "Publishing failed, please try again in a minute."
 *
 * TODO(step 6):
 *   - Implement onOpen() and publishToWebsite() with UrlFetchApp
 *     (muteHttpExceptions: true so non-200 responses can be shown).
 *   - Check the Vercel docs for the supported Deployment Protection bypass for
 *     automation and add the header it needs (CLAUDE.md → Environment safety).
 */

/** Adds the "Website" menu. Runs automatically when the Doc is opened. */
function onOpen() {
  // TODO(step 6): DocumentApp.getUi().createMenu('Website')
  //   .addItem('Publish to website', 'publishToWebsite').addToUi();
}

/** Sends the publish request and shows the result to the editor. */
function publishToWebsite() {
  // TODO(step 6): read Script Properties, UrlFetchApp.fetch(...), show popup by status.
}
