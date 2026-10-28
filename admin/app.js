import {orderPaymentStatusLabel} from '../shared/order-payment-status.js?v=ui-batch3-followup-20261027';
import {orderExtraFilterLabels,extraFilterSummary} from './workspace/list-filters.js?v=ui-batch3-followup-20261027';
import {createOrderTerms} from './documents/order-terms.js?v=ui-batch234-20261027';
import {orderListMarkup} from './orders/list.js?v=calm-workspaces-20261027';
import {createMobileNotifications} from './notifications/client.js?v=payment-alerts-20261027';
import {createPaymentNotifications} from './payments/notifications.js?v=payment-alerts-20261027';
import {storeTransaction,synchronousTransactionResult} from './workspace/transactions.js?v=crm-code-review-20261027';
import {copyOrder} from '../shared/order-copy.js?v=crm-code-review-20261027';
import {createDossierActions} from './workspace/dossier-actions.js?v=crm-code-review-20261027';
import {createDossierPreferences,orderSortOptions} from './workspace/dossier-preferences.js?v=ui-batch3-followup-20261027';
import {createWebsiteDossier} from './analytics/dossier.js?v=inquiry-headers-20261023';
import {orderStagesFor,displayOrderStage} from '../shared/companies.js';
import {createAutomaticPhaseSync} from './mail/automatic-phase-sync.js?v=ui-batch234-20261027';
import {createPhaseLabelSync} from './mail/phase-label-sync.js?v=ui-batch234-20261027';
import {saveOnlineAssistantPlan} from './assistant/online-plan.js?v=feedback-launcher-20261020';
import {vatProtectedOrder} from '../shared/vat-ledger.js';
import {createOverviewSettings} from './workspace/overview-settings.js?v=calm-workspaces-20261027';
import {installSectionTabs,syncSectionTabs} from './workspace/section-tabs.js?v=calm-workspaces-20261027';
import {createGeneratedDocumentForms} from './documents/generated-forms.js?v=ui-batch234-20261027';
import {createDocumentWorkspace} from './documents/library-workspace.js?v=calm-workspaces-20261027';
import {createCustomerDossier} from './customers/dossier.js?v=calm-workspaces-20261027';
import {createOrderWorkspace} from './orders/workspace.js?v=calm-workspaces-20261027';
import {createOrderPlanning} from './orders/planning.js?v=ui-batch234-20261027';
import {createOrderAddresses,deliveryEditBasis} from './orders/addresses.js?v=crm-code-review-20261027';
import {createProductImages} from './products/images.js?v=ui-batch234-20261027';
import {createPurchaseWorkspace} from './purchases/batch-workspace.js?v=calm-workspaces-20261027';
import {createMailAttachments} from './mail/attachments.js';
import {createMailComposer} from './mail/composer.js?v=ui-batch4-followup-20261027';
import {createAiImportFlow} from './inquiries/ai-import-flow.js?v=central-overview-20261027';
import {createAnalyticsWorkspace} from './analytics/workspace.js?v=calm-workspaces-20261027';
import {financialChartMarkup,mountFinancialChart} from './analytics/financial-chart.js?v=analytics-workspace-20261024';
import {invoicePaymentSelection,invoicePaymentNote} from '../shared/invoice-payments.js';
import {invoicePaymentsMarkup} from './documents/payment-selection.js?v=batch2-payments-20261023';
import {namedCostSummary} from '../shared/named-costs.js';
import {namedCostsMarkup,installNamedCosts} from './orders/named-costs.js';
import {releaseMarkup,createReleaseUI} from './orders/production-release.js?v=ui-batch234-20261027';
import {paymentCorrectionHistory,createPaymentCorrectionUI} from './orders/payment-corrections.js?v=batch2-payments-20261023';
import {batchEconomicsMarkup,deliveryScenarioMarkup,installBatchEconomics} from './purchases/economics.js';
import {installPrimaryImage} from './products/primary-image.js?v=maat-cleanup-20261021';
import {installCustomerNumberSettings} from './customers/number-settings.js';
import {batchPackingMarkup,installBatchPacking} from './purchases/packing.js?v=ui-batch234-20261027';
import {arrivalButton,installArrivalMail} from './purchases/arrival.js?v=ui-batch234-20261027';
import {guardPurchaseLink,latePurchase,batchDocumentKinds} from '../shared/purchase-workflow.js';
import {transitAcknowledgement,installTransitWarning,batchDocumentsMarkup,batchArchiveButton,installPurchaseWorkflow} from './purchases/workflow.js';
import {htmlSignatureMessage,signatureFrame} from '../shared/mail-signature.js?v=signatures-20261021';
import {fulfilmentMarkup,installFulfilment} from './orders/fulfilment.js?v=ui-batch234-20261027';
import {replaceBuildTasks} from './workspace/build-task-store.js?v=calm-workspaces-20261027';
import {preferredOpenPurchase,isOpenPurchase} from '../shared/purchase-default.js';
import {sampleOrderFields,readSampleFields,sampleOrderSummary} from './products/sample-order.js';
import {customerExecutionDetails,readExecutionFields} from '../shared/product-specifications.js?v=product-thickness-20261021';
import {executionFields} from './products/specifications.js';
import {decimalNumber} from '../shared/decimal-input.js';
import {applyCompanyFavicon} from './branding.js';
import {isReviewMode,prepareReview,reviewBannerMarkup,installReviewGuard} from './offline/review.js';
installReviewGuard(message=>toast(message));
import {mountWebsiteAnalytics,analyticsTabs} from './analytics/website.js?v=weekly-analytics-20261027';
import {mountGoogleAnalytics} from './analytics/google.js?v=weekly-analytics-20261027';
import {orderReadiness} from '../shared/order-readiness.js?v=ui-batch234-20261027';
import {createWorkspaceSearch,searchLauncherMarkup} from './search/workspace-search.js?v=stable-search-20261017';
import {documentReplyContext,documentReplyChoices} from '../shared/document-mail-context.js?v=crm-code-review-20261027';
import {createCustomerViews} from './customers/views.js?v=calm-workspaces-20261027';
import {navigationMarkup,workspaceContextMarkup} from './workspace/navigation.js?v=ui-batch1-20261027';
import {createBuildTasks} from './workspace/development-plan.js?v=calm-workspaces-20261027';
import {markProvenance} from '../shared/provenance.js?v=provenance-colors-20261027';
import {provenanceText,markFormSources,markGeneratedMail,mailFormProvenance,formRecordProvenance} from './provenance-ui.js?v=provenance-colors-20261027';
import {installSidebar,createUsagePreferences} from "./workspace/preferences.js?v=ui-batch1-20261027";
import {createSalesFunnelUI} from './sales-funnel.js?v=ui-batch234-20261027';
import {createInventoryUI} from './inventory.js?v=workspace-search-20261017';
import {orderCostingMarkup,focusOrderCosting} from "./orders/costing.js?v=analytics-workspace-20261024";
import {customerWithSources,inquiryWithSources,reviewSpecsProposal} from '../shared/inquiries.js?v=ui-batch234-20261027';
import {createInquiryMailUI} from './inquiry-mail.js?v=ui-batch234-20261027';
import {createInquiryUI} from './inquiry-ui.js?v=ui-batch2-resume-20261027';
import {installMobileUI} from './mobile-ui.js?v=batch1-mobile-20261023';
import {reviewAssistantMail} from '../shared/assistant-mail.js';
import {runGuidedAction,showGuidance,guidanceMarkup,installGuidedActions} from './guided-actions.js';
import {openInlineFormTask} from './inline-tasks.js?v=crm-code-review-20261027';
import {costingPickerMarkup,installCostingPickers,readCostingLink,validateCostingSources,finishCostingItem,purchaseCalculationMarkup,installPurchaseCalculation} from './costing-links.js?v=provenance-colors-20261027';
import {formProblem,focusFormField,showFormProblem,textFormValues,changedFormValues,restoreFormValues,validateForm,installFormGuidance,hasActiveFormEdits,installFormEditProtection} from './form-guidance.js?v=crm-code-review-20261027';
import {documentRemovalInfo,removeDocument} from '../shared/document-removal.js?v=crm-code-review-20261027';
import {documentBundles,documentFormat,documentVersionGroups} from "./documents/library.js?v=workspace-search-20261017";
import {canReviseDocument,appendDocumentRevision,documentVersion,documentVersionLabel,documentDownloadName} from '../shared/document-revisions.js?v=batch4-editor-20261023';
import {openDocumentRevision} from './documents/revision-editor.js?v=crm-code-review-20261027';
import {createCategoryPreferences,installCategoryReorder,documentLayoutToolbar,documentLayoutAttributes} from "./documents/layout.js?v=calm-workspaces-20261027";
import {previewDocument,createDocumentPreview} from "./documents/preview.js?v=batch2-payments-20261023";
import {loading} from './loading.js';
import {createAiExportUI} from './ai-export.js?v=payments-overview-20261027';
import {applyShippingPrice,shippingPriceSignature} from '../shared/order-repairs.js?v=crm-code-review-20261027';
import {emailDocuments,emailSender,documentMail,mailStatusLabel,emailIsFullyPaid} from '../shared/mail-workflow.js';
import {prepareQuickReplyDraft,saveQuickReplyDraft} from '../shared/mail-drafts.js?v=provenance-colors-20261027';
import {mailOwner,mailOwnerSignature,assertMailStorage} from '../shared/mail-inbox.js?v=crm-code-review-20261027';
import {standardTemplateMail,templateContext,checkMailText} from '../shared/mail-templates.js?v=mail-texts-20261027';
import {createMailTemplatesUI} from "./mail/templates.js?v=provenance-colors-20261027";
import {createMailInboxUI,request as gmailRequest} from './mail-inbox.js?v=calm-workspaces-20261027';
import {emailAvailable,emailRequest,emailSettingsMarkup,installEmailSettings,openInlineEmailSettings,pdfEmailAttachment} from './email-service.js?v=crm-code-review-20261027';
import {installAssistant} from './assistant.js?v=ui-batch234-20261027';
import {assistantPageContext} from '../shared/assistant-page-context.js?v=payments-overview-20261027';
import {applyAssistantPlan,assistantSnapshot} from '../shared/assistant-domain.js?v=ui-batch234-20261027';
import {createSessionUndo} from './session-undo.js';
import {companyFor,toolUrl} from '../shared/companies.js?v=analytics-workspace-20261024';
import {openCrmDatabase,storageRuntime,startCloudRefresh} from './cloud-storage.js?v=crm-code-review-20261027';
import {migrationPanel,installMigration,backupBlob,parseBackup,readCloudPackage,replaceDesigns,readBrowserPackage} from './cloud-migration.js?v=calm-workspaces-20261027';
import {ensureCustomerNumbers} from "./customers/numbers.js?v=documents-flexible-20261010";
import {defaultOrderSearch,defaultCustomerSearch,searchOrderItems,orderDossierLabel,searchCustomers,orderFilterError,quoteOutcomeOptions} from "./workspace/dossier-search.js?v=ui-batch3-followup-20261027";
import {installFeedback} from './feedback.js?v=crm-code-review-20261027';
import { renderDeliveryMap, renderOrdersMap } from "./orders/delivery-map.js?v=delivery-map-20261021";
import { importLocalOrders } from './local-import.js?v=documents-types-20261010';
import {supplierInvoices,invoiceFinance,supplierFinance,physicalQuantity,syncSupplierInvoiceCosts,itemCostTotal} from "./purchases/costs.js?v=invoices-20261009-2";
import {customerAiPrompt,orderAiPrompt,supplierAiPrompt,parseAiAnswer,normalizeAiOrder,normalizeAiSupplier,aiOrderDates,aiSupplierKeys} from './ai-import.js?v=maat-cleanup-20261021';
import {documentTypes,nextDocumentNumber,addressParts,renderConfirmation,customerDocumentItems,packingSlipItems} from "./documents/generation.js?v=product-thickness-20261021";
import {paymentBasis,requestedAmount,applyTikkiePayments} from "./orders/payment-workflow.js?v=mobile-push-20261023";
import {createPaymentsWorkspace} from './payments/workspace.js?v=calm-workspaces-20261027';

// Live getters preserve state replacement and route changes across asynchronous feature actions.
const appContext={
 get orderTerms(){return orderTerms;},
 get emailDraftForm(){return emailDraftForm;},
 get refreshExternalState(){return refreshExternalState;},
 get $(){return $;},
 get websiteDossier(){return websiteDossier;},
 get acceptedImageTypes(){return acceptedImageTypes;},
 get addDocuments(){return addDocuments;},
 get saveMailAttachment(){return mailAttachments.save;},
 get addressParts(){return addressParts;},
 get aiSupplierKeys(){return aiSupplierKeys;},
 get allocatedAmount(){return allocatedAmount;},
 get analyticsPeriod(){return analyticsPeriod;}, set analyticsPeriod(value){analyticsPeriod=value;},
 get analyticsTabs(){return analyticsTabs;},
 get appendDocumentRevision(){return appendDocumentRevision;},
 get applyShippingPrice(){return applyShippingPrice;},
 get area(){return area;},
 get arrivalButton(){return arrivalButton;},
 get assertMailStorage(){return assertMailStorage;},
 get assistant(){return assistant;},
 get assistantSnapshot(){return assistantSnapshot;},
 get badge(){return badge;},
 get batchArchiveButton(){return batchArchiveButton;},
 get batchDocumentKinds(){return batchDocumentKinds;},
 get batchDocumentsMarkup(){return batchDocumentsMarkup;},
 get batchEconomicsMarkup(){return batchEconomicsMarkup;},
 get batchPackingMarkup(){return batchPackingMarkup;},
 get beginLocalStateChange(){return beginLocalStateChange;},
 get billingBlock(){return billingBlock;},
 get billingDetails(){return billingDetails;},
 get button(){return button;},
 get canReviseDocument(){return canReviseDocument;},
 get categoryPreferences(){return categoryPreferences;},
 get cents(){return cents;},
 get changedFormValues(){return changedFormValues;},
 get checkMailText(){return checkMailText;},
 get compactWorkflow(){return compactWorkflow;},
 get company(){return company;},
 get confirmationForm(){return confirmationForm;},
 get copyCommunication(){return copyCommunication;},
 get costingPickerMarkup(){return costingPickerMarkup;},
 get customer(){return customer;},
 get customerDocumentItems(){return customerDocumentItems;},
 get customerExecutionDetails(){return customerExecutionDetails;},
 get customerForm(){return customerForm;},
 get customerKeys(){return customerKeys;},
 get customerOrders(){return customerOrders;},
 get customerPrompt(){return customerPrompt;},
 get mobileNotifications(){return mobileNotifications;},
 get customerSearch(){return customerSearch;}, set customerSearch(value){customerSearch=value;},
 get customerViews(){return customerViews;},
 get customerWithSources(){return customerWithSources;},
 get date(){return date;},
 get db(){return db;},
 get decimalNumber(){return decimalNumber;},
 get defaultOrderSearch(){return defaultOrderSearch;},
 get deliveryBlock(){return deliveryBlock;},
 get deliveryDetails(){return deliveryDetails;},
 get deliveryDrafts(){return deliveryDrafts;},
 get deliveryScenarioMarkup(){return deliveryScenarioMarkup;},
 get documentCategories(){return documentCategories;},
 get documentCategory(){return documentCategory;},
 get documentDeleteButton(){return documentDeleteButton;},
 get documentFormat(){return documentFormat;},
 get documentImageUrls(){return documentImageUrls;},
 get documentLayoutAttributes(){return documentLayoutAttributes;},
 get documentLayoutToolbar(){return documentLayoutToolbar;},
 get documentFile(){return documentFile;},
 get documentPaymentActions(){return documentPaymentActions;},
 get documentRemovalInfo(){return documentRemovalInfo;},
 get documentReplyChoices(){return documentReplyChoices;},
 get documentReplyContext(){return documentReplyContext;},
 get documentTargets(){return documentTargets;},
 get documentTypes(){return documentTypes;},
 get documentUploadQueue(){return documentUploadQueue;}, set documentUploadQueue(value){documentUploadQueue=value;},
 get documentVersion(){return documentVersion;},
 get documentVersionGroups(){return documentVersionGroups;},
 get documentVersionLabel(){return documentVersionLabel;},
 get documents(){return documents;},
 get documentsForOwner(){return documentsForOwner;},
 get downloadBlob(){return downloadBlob;},
 get dutyAmount(){return dutyAmount;},
 get dutyFields(){return dutyFields;},
 get economics(){return economics;},
 get elapsed(){return elapsed;},
 get emailAvailable(){return emailAvailable;},
 get emailDocuments(){return emailDocuments;},
 get emailIsFullyPaid(){return emailIsFullyPaid;},
 get emailRequest(){return emailRequest;},
 get emailSender(){return emailSender;},
 get ensureCustomerNumbers(){return ensureCustomerNumbers;},
 get esc(){return esc;},
 get euro(){return euro;},
 get executionFields(){return executionFields;},
 get field(){return field;},
 get financialChartMarkup(){return financialChartMarkup;},
 get finishCostingItem(){return finishCostingItem;},
 get focusOrderCosting(){return focusOrderCosting;},
 get formProblem(){return formProblem;},
 get formRecordProvenance(){return formRecordProvenance;},
 get freightShareDescription(){return freightShareDescription;},
 get fulfilmentMarkup(){return fulfilmentMarkup;},
 get funnelUI(){return funnelUI;},
 get guardPurchaseLink(){return guardPurchaseLink;},
 get heading(){return heading;},
 get htmlSignatureMessage(){return htmlSignatureMessage;},
 get imageTag(){return imageTag;},
 get inboxUI(){return inboxUI;},
 get inquiryUI(){return inquiryUI;},
 get inquiryWithSources(){return inquiryWithSources;},
 get installCostingPickers(){return installCostingPickers;},
 get installPurchaseCalculation(){return installPurchaseCalculation;},
 get installTransitWarning(){return installTransitWarning;},
 get inventoryUI(){return inventoryUI;},
 get invoiceFinance(){return invoiceFinance;},
 get invoicePaymentNote(){return invoicePaymentNote;},
 get invoicePaymentSelection(){return invoicePaymentSelection;},
 get invoicePaymentsMarkup(){return invoicePaymentsMarkup;},
 get isDocumentImage(){return isDocumentImage;},
 get isOpenPurchase(){return isOpenPurchase;},
 get itemCostTotal(){return itemCostTotal;},
 get itemDimensions(){return itemDimensions;},
 get itemFields(){return itemFields;},
 get latePurchase(){return latePurchase;},
 get leadTimeFields(){return leadTimeFields;},
 get deliveryWindow(){return deliveryWindow;},
 get installLeadTimeFields(){return installLeadTimeFields;},
 get loading(){return loading;},
 get mailFormProvenance(){return mailFormProvenance;},
 get mailOwner(){return mailOwner;},
 get mailOwnerSignature(){return mailOwnerSignature;},
 get mailStatusLabel(){return mailStatusLabel;},
 get markFormSources(){return markFormSources;},
 get markGeneratedMail(){return markGeneratedMail;},
 get markProvenance(){return markProvenance;},
 get mergeStoredState(){return mergeStoredState;},
 get mountFinancialChart(){return mountFinancialChart;},
 get mountGoogleAnalytics(){return mountGoogleAnalytics;},
 get mountWebsiteAnalytics(){return mountWebsiteAnalytics;},
 get namedCostSummary(){return namedCostSummary;},
 get namedCostsMarkup(){return namedCostsMarkup;},
 get nextDocumentNumber(){return nextDocumentNumber;},
 get normalizeAiOrder(){return normalizeAiOrder;},
 get normalizeAiSupplier(){return normalizeAiSupplier;},
 get notifyDataChanged(){return notifyDataChanged;},
 get openDocumentRevision(){return openDocumentRevision;},
 get openForm(){return openForm;},
 get openInlineEmailSettings(){return openInlineEmailSettings;},
 get openPaymentCorrection(){return openPaymentCorrection;},
 get options(){return options;},
 get order(){return order;},
 get orderAiPrompt(){return orderAiPrompt;},
 get orderContactBlock(){return orderContactBlock;},
 get orderCostingMarkup(){return orderCostingMarkup;},
 get orderForm(){return orderForm;},
 get orderMapFilter(){return orderMapFilter;}, set orderMapFilter(value){orderMapFilter=value;},
 get orderMapPurchase(){return orderMapPurchase;}, set orderMapPurchase(value){orderMapPurchase=value;},
 get orderPlanningBlock(){return orderPlanningBlock;},
 get orderReadiness(){return orderReadiness;},
 get orderSearch(){return orderSearch;}, set orderSearch(value){orderSearch=value;},
 get orderSummaryRows(){return orderSummaryRows;},
 get orderTimeline(){return orderTimeline;},
 get orderView(){return orderView;}, set orderView(value){orderView=value;},
 get packagePriceFields(){return packagePriceFields;},
 get packingSlipForm(){return packingSlipForm;},
 get packingSlipItems(){return packingSlipItems;},
 get paidDate(){return paidDate;},
 get parseAiAnswer(){return parseAiAnswer;},
 get paymentCorrectionHistory(){return paymentCorrectionHistory;},
 get paymentLinksPanel(){return paymentLinksPanel;},
 get paymentStatus(){return paymentStatus;},
 get pdfEmailAttachment(){return pdfEmailAttachment;},
 get percent(){return percent;},
 get persistSupplierInvoice(){return persistSupplierInvoice;},
 get physicalQuantity(){return physicalQuantity;},
 get preferredOpenPurchase(){return preferredOpenPurchase;},
 get preparePaymentLink(){return preparePaymentLink;},
 get prepareQuickReplyDraft(){return prepareQuickReplyDraft;},
 get previewDocument(){return previewDocument;},
 get productImageActions(){return productImageActions;},
 get productImageCard(){return productImageCard;},
 get productRevenue(){return productRevenue;},
 get purchase(){return purchase;},
 get purchaseCalculationMarkup(){return purchaseCalculationMarkup;},
 get purchaseInfo(){return purchaseInfo;},
 get purchaseOrders(){return purchaseOrders;},
 get purchaseSelect(){return purchaseSelect;},
 get quoteOutcomeFields(){return quoteOutcomeFields;},
 get quoteOutcomeOptions(){return quoteOutcomeOptions;},
 get readCostingLink(){return readCostingLink;},
 get readDuty(){return readDuty;},
 get readExecutionFields(){return readExecutionFields;},
 get readItems(){return readItems;},
 get readLeadTime(){return readLeadTime;},
 get readPackagePrice(){return readPackagePrice;},
 get readSampleFields(){return readSampleFields;},
 get releaseMarkup(){return releaseMarkup;},
 get removeDocument(){return removeDocument;},
 get render(){return render;},
 get renderConfirmation(){return renderConfirmation;},
 get renderDeliveryMap(){return renderDeliveryMap;},
 get renderOrder(){return renderOrder;},
 get renderOrdersMap(){return renderOrdersMap;},
 get restoreFormValues(){return restoreFormValues;},
 get reviewAssistantMail(){return reviewAssistantMail;},
 get route(){return route;},
 get runGuidedAction(){return runGuidedAction;},
 get runtime(){return runtime;},
 get safePaymentUrl(){return safePaymentUrl;},
 get sampleOrderFields(){return sampleOrderFields;},
 get sampleOrderSummary(){return sampleOrderSummary;},
 get saveQuickReplyDraft(){return saveQuickReplyDraft;},
 get shell(){return shell;},
 get shippingPriceSignature(){return shippingPriceSignature;},
 get showArchivedPurchases(){return showArchivedPurchases;}, set showArchivedPurchases(value){showArchivedPurchases=value;},
 get showFormProblem(){return showFormProblem;},
 get showGuidance(){return showGuidance;},
 get signatureFrame(){return signatureFrame;},
 get signedEuro(){return signedEuro;},
 get stages(){return stages;},
 get standardTemplateMail(){return standardTemplateMail;},
 get usageUI(){return usageUI;},
 get migrationPanel(){return migrationPanel;},
 get emailSettingsMarkup(){return emailSettingsMarkup;},
 get sortedOrders(){return sortedOrders;},
 get ordersTable(){return ordersTable;},
 get hasActiveFormEdits(){return hasActiveFormEdits;},
 get state(){return state;}, set state(value){state=value;},
 get store(){return store;},
 get supplierAiPrompt(){return supplierAiPrompt;},
 get supplierFinance(){return supplierFinance;},
 get supplierInvoices(){return supplierInvoices;},
 get supplierItems(){return supplierItems;},
 get syncSupplierInvoiceCosts(){return syncSupplierInvoiceCosts;},
 get templateContext(){return templateContext;},
 get templatesUI(){return templatesUI;},
 get textFormValues(){return textFormValues;},
 get toast(){return toast;},
 get today(){return today;},
 get toolUrl(){return toolUrl;},
 get totals(){return totals;},
 get transitAcknowledgement(){return transitAcknowledgement;},
 get uid(){return uid;},
 get updateCombinedOrderForm(){return updateCombinedOrderForm;},
 get updateCommunication(){return updateCommunication;},
 get updateDutyPreview(){return updateDutyPreview;},
 get updateInvoiceTotal(){return updateInvoiceTotal;},
 get validateCostingSources(){return validateCostingSources;},
 get validateForm(){return validateForm;},
};
const websiteDossier=createWebsiteDossier(appContext);
const paymentsWorkspace=createPaymentsWorkspace(appContext);
const {renderSettings,renderDashboard}=createOverviewSettings(appContext);
const {shippingPriceForm,editGeneratedDocument,confirmationSignature,confirmationForm,packingSlipForm}=createGeneratedDocumentForms(appContext);
const {orderedDocumentCategories,documentsForOwner,documentSource,documentPreviewButton,documentFile,documentDeleteButton,deleteDocumentForm,documentBundleCard,documentCreateButton,documentCreationForm,documents,addDocuments,upload,clearDropHighlights,downloadBlob}=createDocumentWorkspace(appContext);
const {renderCustomersList,customerOrders,customerAddressInfo,syncSingleOrderDelivery,customerAddressSummary,customerAddresses,renderCustomer,selectCustomerTab,customerForm}=createCustomerDossier(appContext);
const {packagePriceFields,readPackagePrice,updatePackagePricing,renderOrder,orderCostsView,orderPaymentsView,costForm,itemDimensions,productionLabel,updateItemMeasurements,installOrderCosting,itemFields,readItems,updateCombinedOrderForm,orderForm,paymentForm,noteForm,quoteForm,orderTimeline,changeOrderStage,registerOrderProgress,workflowActions,selectOrderTab}=createOrderWorkspace(appContext);
const {elapsed,paidDate,compactWorkflow,orderSummaryRows,addCalendarDays,calendarDays,deliveryWindow,deliveryTiming,leadTimeFields,installLeadTimeFields,readLeadTime,orderPlanningBlock,planningSummary,planningForm}=createOrderPlanning(appContext);
const {deliveryDetails,billingDetails,orderContactBlock,billingBlock,billingForm,deliveryValues,deliveryBlock,deliveryForm,updateDeliveryDraft}=createOrderAddresses(appContext);
const {isDocumentImage,productImages,imageTag,renderDocumentImages,productImageActions,productImageCard,uploadProductImage,viewProductImage,markProductImage}=createProductImages(appContext);
const {purchase,supplierItems,purchaseOrders,dutyAmount,dutyFields,readDuty,updateDutyPreview,purchaseInfo,allocationWeight,allocatedAmount,allocatedCost,freightShareDescription,purchaseSelect,linkPurchaseForm,renderPurchases,renderPurchase,invoiceButton,supplierInvoiceView,invoiceLineFields,updateInvoiceTotal,persistSupplierInvoice,supplierInvoiceForm,supplierPaymentForm,purchaseForm}=createPurchaseWorkspace(appContext);
const orderTerms=createOrderTerms(appContext);
const mailAttachments=createMailAttachments(appContext);
const {saveQuickEmailDraft,quickEmailPreview,newInboxMail,analyseInquiry,startInvoiceMail,openAssistantMail,emailDraftForm,prepareEmailPreview}=createMailComposer(appContext);
const {aiCustomerForm,aiImportDialog,aiOrderForm,aiPaymentFields,readAiPayments,reviewAiOrder,updateAiOrderCosts,aiAttachmentFields,aiSupplierForm,supplierLineChoices,aiSupplierLineFields,updateAiSupplierChoices,reviewAiSupplier}=createAiImportFlow(appContext);
const {analyticsDateRange,inAnalyticsPeriod,analyticsChart,renderOrderMap,renderAnalytics}=createAnalyticsWorkspace(appContext);

const finishStartup=loading.begin('CRM laden…');

document.addEventListener('click',e=>{const b=e.target.closest('[data-action]'),kind={'make-confirmation':'confirmation','make-quote':'quote','make-proforma':'proforma','make-invoice':'invoice','make-packing':'packing'}[b?.dataset.action];if(kind){try{if(kind==='packing')packingSlipForm(b.dataset.id);else confirmationForm(b.dataset.id,kind);}catch(error){toast(error.message);}}});
document.addEventListener('click',event=>{const control=event.target.closest('[data-action="edit-document"]');if(control)try{editGeneratedDocument(control.dataset.id);}catch(error){toast(error.message);}});
const $ = s => document.querySelector(s);
const uid = () => crypto.randomUUID();
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro = n => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format((n||0)/100);
const CRM_TIME_ZONE='Asia/Makassar';
const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:CRM_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=key=>parts.find(p=>p.type===key).value;return `${get('year')}-${get('month')}-${get('day')}`;};
const date = d => d ? new Date(d+'T12:00:00').toLocaleDateString('nl-NL') : '—';
const cents = v => Math.round(Number(String(v).replace(',','.'))*100);
const runtime=await storageRuntime().catch(error=>{finishStartup({error:true});document.querySelector('#app').textContent='CRM laden mislukt: '+error.message;const link=document.createElement('a');link.href=isReviewMode()?'/admin/':'/admin/offline/';link.textContent=isReviewMode()?'Online CRM openen en opnieuw aanmelden':'Offline werkplek openen';document.querySelector('#app').append(document.createElement('br'),link);throw error;});
const company=companyFor(runtime.companyId);applyCompanyFavicon(company);document.title=company.name+' • CRM';
const stages=orderStagesFor(company.id);
const buildTasks=createBuildTasks({company,openForm,toast});
if(runtime.mode==='cloud'&&navigator.serviceWorker)void navigator.serviceWorker.getRegistration('/').then(reg=>{if(reg?.active?.scriptURL&&new URL(reg.active.scriptURL).pathname==='/crm-offline-sw.js')return reg.update();}).catch(()=>{});
const rawDb=await openCrmDatabase().catch(error=>{finishStartup({error:true});document.querySelector('#app').textContent='Opslag openen mislukt: '+error.message;throw error;});
const sessionUndo=createSessionUndo(rawDb,{onChange:refreshUndoButton,getRoute:()=>location.hash});
const db=sessionUndo.db;
const dossierActions=createDossierActions(appContext);
function store(name,mode,fn){if(name==='state'&&mode==='readwrite')beginLocalStateChange();return storeTransaction(db,name,mode,fn,{onCommitted:()=>{if(name==='state'&&mode==='readwrite')notifyDataChanged();}});}
let state = await store('state','readonly',s=>s.get('main')).catch(error=>{finishStartup({error:true});document.querySelector('#app').textContent='Gegevens laden mislukt: '+error.message;throw error;}) || {customers:[],orders:[],payments:[],documents:[],activities:[]};
state.purchases ??= [];
const paymentNotifications=createPaymentNotifications({company,getState:()=>state,euro:value=>euro(value),toast:message=>toast(message)});
let analyticsPeriod='all';
let orderMapFilter='production',orderMapPurchase='';
let orderView={id:'',tab:'overview'};
const documentImageUrls=new Map();
const acceptedImageTypes=new Set(['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml']);
const deliveryDrafts=new Map();
// Keep idle views in other local CRM tabs current without replacing active edits.
const dataChannel=typeof BroadcastChannel==='function'?new BroadcastChannel(company.id+'-crm-changes'):null;
let externalRefreshSeq=0,pendingExternalRefresh=false;
function beginLocalStateChange(){if(pendingExternalRefresh)throw Error('Gegevens zijn bijgewerkt in een ander CRM-tabblad. Annuleer je bewerking en open deze opnieuw om met de nieuwste gegevens te werken.');externalRefreshSeq++;}
function notifyDataChanged(){paymentNotifications.observe(state);dataChannel?.postMessage('changed');document.dispatchEvent(new Event('crm-data-changed'));}
// The callback must be synchronous: read and merge in one IndexedDB transaction.
async function mergeStoredState(mutate){
 externalRefreshSeq++;
 let next,result;
 await new Promise((resolve,reject)=>{
  const tx=db.transaction('state','readwrite'),ss=tx.objectStore('state'),r=ss.get('main');
  r.onsuccess=()=>{try{
   next=r.result||{customers:[],orders:[],payments:[],documents:[],activities:[]};next.purchases??=[];
   result=synchronousTransactionResult(mutate(next));ensureCustomerNumbers(next);ss.put(next,'main');
  }catch(error){tx.abort();reject(error);}};
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Opslaan afgebroken. Probeer opnieuw.'));
 });
 state=next;pendingExternalRefresh=false;notifyDataChanged();return result;
}
installFormEditProtection(document);
function editingLocally(){return deliveryDrafts.size>0||Boolean(document.querySelector('dialog[open]'))||hasActiveFormEdits(document);}
async function refreshExternalState({throwOnError=false}={}){
 if(editingLocally())return {updated:false,reason:'Sla je openstaande bewerking eerst op of sluit deze.'};
 const seq=++externalRefreshSeq;
 try{
  const latest=await store('state','readonly',s=>s.get('main'));
  if(seq!==externalRefreshSeq)return {updated:false,reason:'Er is intussen een andere wijziging verwerkt. Probeer bijwerken opnieuw.'};
  if(editingLocally())return {updated:false,reason:'Je openstaande invoer is behouden. Werk na het opslaan opnieuw bij.'};
  if(latest){sessionUndo.observe(latest);state=latest;state.purchases??=[];state.orders.forEach(syncSingleOrderDelivery);paymentNotifications.observe(state);render();}
  pendingExternalRefresh=false;
  return {updated:!!latest,reason:latest?'':'Er zijn nog geen opgeslagen CRM-gegevens gevonden.'};
 }catch(error){if(throwOnError)throw error;/* A failed focus refresh is not evidence of a change in another tab. */}
}
dataChannel?.addEventListener('message',()=>{pendingExternalRefresh=true;refreshExternalState();});
window.addEventListener('focus',()=>refreshExternalState());
document.addEventListener('close',()=>{if(pendingExternalRefresh)refreshExternalState();},true);
const mobileNotifications=createMobileNotifications({company,runtime});
const dossierPreferences=createDossierPreferences(company.id);
const initialOrderSort=dossierPreferences.orderSort().split(':');
let search='', filter='', sort=initialOrderSort[0], ascending=initialOrderSort[1]==='asc';
let orderSearch=defaultOrderSearch(),customerSearch=defaultCustomerSearch(dossierPreferences.customerSort());
let toastTimer=null,toastSequence=0;
function toast(text){
 toastSequence++;clearTimeout(toastTimer);const box=$('#toast');box.textContent=text;box.style.display='block';
 // A popover keeps save/error feedback visible above an open modal form.
 if(typeof box.showPopover==='function'){try{if(!box.matches(':popover-open'))box.showPopover();}catch{}}
 toastTimer=setTimeout(()=>{if(typeof box.hidePopover==='function'){try{if(box.matches(':popover-open'))box.hidePopover();}catch{}}box.style.display='none';},6000);
}
const usageUI=createUsagePreferences(company.id);
const templatesUI=createMailTemplatesUI({company,getState:()=>state,mergeStoredState,openForm,toast,render,uid});
const inquiryMailUI=createInquiryMailUI({getState:()=>state,company,mergeStoredState,openForm,toast});
const inquiryUI=createInquiryUI({getState:()=>state,mergeStoredState,company,openForm,render,toast,editOrder:(id,options)=>orderForm(id,undefined,{},options),analyse:analyseInquiry});
const inboxUI=createMailInboxUI({saveAttachment:mailAttachments.save,getState:()=>state,mergeStoredState,company,runtime,openForm,toast,render,compose:emailDraftForm,preview:quickEmailPreview,saveDraft:saveQuickEmailDraft,newMail:newInboxMail,inquiries:inquiryUI,requestInfo:inquiryMailUI.open,analyse:analyseInquiry,editTemplate:templatesUI.editor,uid});
const openProductionRelease=createReleaseUI({getState:()=>state,company,openForm,mergeStoredState,render,toast,euro,esc,today});
const automaticPhaseSync=createAutomaticPhaseSync({company,runtime,getState:()=>state,loadState:()=>store('state','readonly',s=>s.get('main')),mergeStoredState,request:gmailRequest,openForm,toast,render,isEditing:editingLocally});
const phaseLabelSync=createPhaseLabelSync({company,getState:()=>state,request:gmailRequest,openForm,toast});
const funnelUI=createSalesFunnelUI({isAutoPhaseSync:()=>automaticPhaseSync.active,syncGmailPhase:phaseLabelSync.open,releaseProduction:openProductionRelease,getState:()=>state,company,openForm,mergeStoredState,render,toast,compose:emailDraftForm,requestSpecs:inquiryMailUI.open,calculate:id=>{const o=order(id);if(company.tool==='costing'&&o?.items.length===1)location.href=toolUrl(company,o,o.items[0],runtime);else orderForm(id);},documentMail:async(id,kind)=>{if(kind==='invoice')return startInvoiceMail(id);const doc=emailDocuments(state.documents,id).find(d=>(d.generated?.kind||d.category)===kind);if(doc)return emailDraftForm(id,doc.id,'','',{newMail:true,documentId:doc.id});confirmationForm(id,kind,{}, {download:false,afterSave:pdfId=>emailDraftForm(id,pdfId,'','',{newMail:true,documentId:pdfId}).catch(e=>toast(e.message))});},payment:paymentForm,editOrder:orderForm});
const inventoryUI=createInventoryUI({getState:()=>state,mergeStoredState,openForm,render,toast});
const feedback=installFeedback({downloadBlob,today,toast});
document.addEventListener('click',event=>{const button=event.target.closest('[data-gmail-phase-sync]');if(button)phaseLabelSync.open(button.dataset.gmailPhaseSync).catch(error=>toast(error.message));});
let currentAssistantPageContext=null;
const assistant=installAssistant({company,runtime,toast,openAiExport:()=>aiExportUI.open(),composeMail:openAssistantMail,reviewSpecs:async proposal=>{const current=await store('state','readonly',s=>s.get('main')),checked=reviewSpecsProposal(assistantSnapshot(current,company.id),proposal,company.id);state=current;inquiryUI.edit(checked.orderId,checked.fields);},getContext:()=>currentAssistantPageContext,loadState:async()=>await store('state','readonly',s=>s.get('main'))||{customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]},
 savePlan:async plan=>{
  if(editingLocally())throw Error('Sla je openstaande formulier eerst op of sluit het vóór je een assistentvoorstel opslaat.');
  if(runtime.mode==='cloud'&&!runtime.offlineReview)return saveOnlineAssistantPlan(plan,{openForm,onApplied:async()=>{externalRefreshSeq++;const latest=await store('state','readonly',s=>s.get('main'));if(!latest)throw Error('Het bijgewerkte overzicht ontbreekt.');sessionUndo.observe(latest);state=latest;state.purchases??=[];state.orders.forEach(syncSingleOrderDelivery);pendingExternalRefresh=false;notifyDataChanged();render();}});
  if(runtime.mode!=='local')throw Error('Wijzigingen via de assistent zijn niet beschikbaar in deze modus.');
  beginLocalStateChange();let saved;
  await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),ss=tx.objectStore('state'),request=ss.get('main');
   request.onsuccess=()=>{try{saved=applyAssistantPlan(request.result||{customers:[],orders:[],payments:[],documents:[],activities:[],purchases:[]},plan,company.id,{approved:true});ss.put(saved,'main');}catch(error){tx.abort();reject(error);}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Opslaan afgebroken.'));
  });state=saved;notifyDataChanged();render();
 }});

const aiExportUI=createAiExportUI({getState:()=>state,getContext:()=>currentAssistantPageContext,openForm,downloadBlob,toast});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action=ai-export]');if(b){try{aiExportUI.open();}catch(error){toast(error.message);}}});
installMigration({toast,downloadBlob,feedback});
if(runtime.mode==='cloud')startCloudRefresh({onChanged:()=>{pendingExternalRefresh=true;refreshExternalState();}});
const customer = id => state.customers.find(c=>c.id===id);
const order = id => state.orders.find(o=>o.id===id);
function productRevenue(o){return o.packagePrice!=null?o.packagePrice:o.items.reduce((sum,i)=>sum+i.quantity*(i.price??0),0);}

document.addEventListener('input',e=>{if(e.target.name==='packagePrice')updatePackagePricing(e.target.form);});

function totals(o){const priceKnown=o.items.length>0&&(o.packagePrice!=null||o.items.every(i=>i.price!=null));const net=productRevenue(o)+(o.shippingCharge||0);const tax=Math.round(net*o.vat/100);const total=net+tax;const paid=state.payments.filter(p=>p.orderId===o.id).reduce((s,p)=>s+p.amount,0);return {net,tax,total,paid,balance:total-paid,priceKnown};}
function paymentStatus(o){return orderPaymentStatusLabel(o,totals(o));}
const badge = (text,color='') => `<span class="badge ${color}">${esc(text)}</span>`;
const options=(list,value)=>list.map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('');
const field=(name,label,value='',type='text',extra='')=>`<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const area=(name,label,value='')=>`<label class="wide">${esc(label)}<textarea name="${name}">${esc(value)}</textarea></label>`;
const route=()=>location.hash.slice(1).split('/');
function shell(content,page,details={}){
 globalSearch.invalidate();
 const [,id,requestedSection]=route();
 const record=page==='orders'&&id?state.orders.find(o=>o.id===id):page==='customers'&&id?state.customers.find(c=>c.id===id):null;
 dossierPreferences.visit(page,record?.id);
 const reference=page==='purchases'&&id?state.purchases.find(p=>p.id===id):null;
 const section=details.section||(record?requestedSection||(page==='orders'?orderView.tab:'details'):reference?requestedSection||'orders':page==='orders'?orderSearch.mode==='prices'?'prices':'list':['customers','purchases'].includes(page)?'list':'');
 const filters=details.filters||(!id&&page==='orders'?{...orderSearch,sort,direction:ascending?'asc':'desc'}:!id&&page==='customers'?customerSearch:page==='order-map'?{stage:orderMapFilter}:{});
 currentAssistantPageContext=assistantPageContext({companyId:company.id,page,section,filters,facts:details.facts||{},visible:details.visible,selected:record?{entity:page==='orders'?'order':'customer',id:record.id,label:page==='orders'?'Order #'+(record.sourceNumber||record.number):record.company}:undefined,reference:reference?{id:reference.id,label:reference.name}:undefined});
 inboxUI.beforeRender?.();feedback.beforeRender();assistant.beforeRender();$('#app').innerHTML=`<div class="shell"><header class="crm-mobile-header"><button type="button" data-mobile-menu aria-controls="crm-navigation" aria-expanded="false">☰ Menu</button><strong>${esc(company.name)}</strong><div data-ai-mobile-launcher-slot></div><div data-feedback-mobile-launcher-slot></div></header><button type="button" class="crm-mobile-backdrop" data-mobile-backdrop aria-label="Menu sluiten"></button><aside id="crm-navigation"><button type="button" data-sidebar-toggle aria-controls="crm-navigation" title="Zijbalk inklappen">«</button><button type="button" class="crm-mobile-close" data-mobile-close>← Menu sluiten</button><div class="brand">${esc(company.brand)}<span class="brand-dot">.</span><small>CRM / ORDERBEHEER</small><small>Versie ${esc(runtime.release || "2.0.0")}</small></div><div class="crm-sidebar-tools">${assistant.enabled?'<div data-ai-launcher-slot></div>':''}<div data-ai-feedback-slot></div></div><nav aria-label="Hoofdnavigatie">${navigationMarkup({company,page,ordersNavigation:page==='orders'&&!record?funnelUI.navigation():''})}</nav><div class="session-undo"><button type="button" data-action="session-undo" disabled>↶ Stap terug</button><small data-undo-label></small><small data-undo-help></small></div><div class="local">${runtime.mode==='cloud'?(runtime.local?'Cloudflare · lokaal testen':'Centrale CRM-opslag')+'<br>D1 + privébestanden in R2':'Lokale ontwikkelversie<br>Opslag in deze browser'}<br>Maak regelmatig een back-up${runtime.mode==='cloud'?'<br><button class="offline-entry" type="button" data-offline-review>Offline-modus</button><br><a href="/admin/offline/">Klanten offline invullen</a>':''}</div>${runtime.authEnabled?'<div class="session-undo"><button type="button" data-action="logout">Uitloggen</button></div>':''}</aside><main class="${page==='orders'&&section==='mail'?'mail-focused-page':['orders','customers'].includes(page)&&section==='documents'?'document-focused-page':''}"><div class="workspace-toolbar">${workspaceContextMarkup({company,page})}${searchLauncherMarkup()}${page==='development'?'':'<div class="ai-export-toolbar"><button type="button" data-action="ai-export" title="Kopieer opgeslagen pagina- of dossiergegevens voor een AI">Exporteren voor AI ↗</button></div>'}</div>${runtime.offlineReview?reviewBannerMarkup(runtime):''}${content}</main></div>`;installMobileUI($('#app'));installSidebar($('#app'),company.id);installGuidedActions($('#app'),{'create-order':()=>orderForm(null,route()[0]==='customers'?route()[1]:undefined),'create-customer':()=>customerForm(),'reset-orders':()=>{funnelUI.reset();const mode=orderSearch.mode;orderSearch=defaultOrderSearch();orderSearch.mode=mode;if(mode==='prices'){orderSearch.visibility='all';orderSearch.expanded=true;}renderOrdersList();},'reset-customers':()=>{customerSearch=defaultCustomerSearch(dossierPreferences.customerSort());renderCustomersList();}},{onError:e=>toast(e.message)});orderTerms.install($('#app'));refreshUndoButton();renderDocumentImages();assistant.mount($('#app'),page);feedback.mount($('#app'));inboxUI.install($('#app'));inventoryUI.install($('#app'));funnelUI.install($('#app'));automaticPhaseSync.mount();if(page==='settings'){mobileNotifications.install($('#app'));installEmailSettings($('#app'),company);templatesUI.installSettings($('#app'));usageUI.install($('#app'));inboxUI.installSettings($('#app'));}}
function refreshUndoButton(){
 const control=$('[data-action=session-undo]');if(!control)return;
 const info=sessionUndo.status();control.disabled=info.busy||!info.count;
 control.textContent=info.busy?'Terugzetten…':'↶ Stap terug';
 control.title=info.label?'Terugdraaien: '+info.label:'Nog geen wijziging om terug te draaien';
 $('[data-undo-label]').textContent=info.label||info.note||'Nog geen wijzigingen in dit tabblad';
 $('[data-undo-help]').textContent=`${info.count?info.count+' / ':''}${info.maxSteps} stappen · vervalt bij herladen`;
}
document.addEventListener('click',async e=>{
 const control=e.target.closest('[data-action=session-undo]');if(!control||control.disabled)return;
 if(editingLocally()){toast('Sla je openstaande bewerking eerst op of annuleer die.');return;}
 if(loading.isBusy('undo'))return;const finishLoading=loading.begin('Wijziging terugdraaien…',{key:'undo',button:control});let failed=false;
 try{
  beginLocalStateChange();const result=await sessionUndo.undo();state=result.state;pendingExternalRefresh=false;
  for(const promise of documentImageUrls.values())promise.then(url=>URL.revokeObjectURL(url)).catch(()=>{});documentImageUrls.clear();deliveryDrafts.clear();
  const parts=(result.route||location.hash).replace(/^#/,'').split('/');
  if(parts[0]==='orders'&&parts[1]&&!order(parts[1]))location.hash='orders';
  else if(parts[0]==='customers'&&parts[1]&&!customer(parts[1]))location.hash='customers';
  else if(parts[0]==='purchases'&&parts[1]&&!purchase(parts[1]))location.hash='purchases';
  else if(result.route)location.hash=result.route;
  notifyDataChanged();render();toast('Teruggedraaid: '+result.label);
 }catch(error){failed=true;toast('Stap terug: '+error.message);await refreshExternalState();}finally{finishLoading({error:failed});}
});
const heading=(title,sub,buttons='')=>`<header class="top page-heading"><div><h1>${title}</h1><span class="muted">${sub}</span></div><div class="actions">${buttons}</div></header>`;
const button=(action,text,id='',primary=false)=>`<button type="button" data-action="${action}" data-id="${esc(id)}" class="${primary?'primary':''}">${text}</button>`;
function ordersTable(list){return orderListMarkup({esc,badge,euro,totals,purchase,customer,company,funnelUI,planningSummary,paymentStatus,orderDossierLabel,guidanceMarkup,route},list,{sort,ascending});}
function sortedOrders(list){
 const byNumber=(a,b)=>String(b.sourceNumber||b.number||'').localeCompare(String(a.sourceNumber||a.number||''),'nl',{numeric:true})||String(a.id).localeCompare(String(b.id));
 if(sort==='opened')return [...list].sort((a,b)=>dossierPreferences.openedAt('orders',b.id)-dossierPreferences.openedAt('orders',a.id)||String(b.date||'').localeCompare(String(a.date||''))||byNumber(a,b));
 const value=o=>sort==='number'?o.sourceNumber||o.number:sort==='customer'?customer(o.customerId)?.company||'':sort in totals(o)?totals(o)[sort]:o[sort];
 return [...list].sort((a,b)=>{const x=value(a),y=value(b);return (typeof x==='number'?x-y:String(x??'').localeCompare(String(y??''),'nl',{numeric:true}))*(ascending?1:-1)||byNumber(a,b);});
}
const searchSelect=(group,key,label,entries,value)=>`<label>${label}<select data-${group}-search="${key}">${entries.map(([v,text])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
const searchInput=(group,key,label,type,value,extra='')=>`<label>${esc(label)}<input type="${type}" data-${group}-search="${key}" value="${esc(value)}" ${extra}></label>`;
function quoteOutcomeFields(o){return searchSelect('quote','outcome','Offerte-uitkomst',quoteOutcomeOptions,o.quoteOutcome||'').replace('data-quote-search="outcome"','name="quoteOutcome"');}
function priceComparison(rows){
 const cm=n=>new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(n/10);
 return `<div class="price-comparisons">${rows.map(({o,item,c,result})=>`<article class="price-comparison"><div class="price-comparison-customer"><a href="#orders/${o.id}"><strong>${esc(c?.company||'Onbekende klant')}</strong><span>Order #${esc(o.sourceNumber||o.number)} · ${date(o.date)}</span></a>${o.archived?badge('Gearchiveerd'):''}</div><div><strong>${esc(item.description)}</strong><p>${item.width&&item.height?`${cm(item.width)} × ${cm(item.height)} cm`:'Maten onbekend'} · ${item.quantity} stuks<br>${company.tool==='design'?(item.printColors==null?'Drukkleuren onbekend':item.printColors===0?'Onbedrukt':`${item.printColors} drukkleur${item.printColors===1?'':'en'}`):[item.material,item.thickness?item.thickness+' mm dik':''].filter(Boolean).map(esc).join(' · ')}</p>${item.specs?`<small>${esc(item.specs)}</small>`:''}</div><div class="comparison-price">${o.packagePrice!=null?`<strong>${euro(o.packagePrice)}</strong><span>Pakketprijs voor alle ${o.items.reduce((s,i)=>s+i.quantity,0)} stuks in deze order</span>`:item.price==null?'<strong>Prijs onbekend</strong>':`<strong>${euro(item.price)} / stuk</strong><span>${euro(item.price*item.quantity)} voor deze productregel</span>`}<small>Excl. btw en verzending</small></div><div class="comparison-outcome">${badge(result.label,result.key==='accepted'?'green':result.key==='declined'?'orange':'')}<span>${esc(displayOrderStage(o.stage,company.id))}</span><a href="#orders/${o.id}/documents">Documenten bekijken →</a></div></article>`).join('')||'<p class="empty">Geen passende producten gevonden. Maak je filters ruimer of wis ze.</p>'}</div>`;
}
function renderOrdersList(){
 dossierPreferences.refresh();
 const f=orderSearch,selection=funnelUI.filter&&funnelUI.filter!=='followup'?{...f,visibility:'all'}:f,rows=searchOrderItems(state,selection,{includeIncomplete:true}).filter(r=>funnelUI.matches(r.o)),error=orderFilterError(f),ids=new Set(rows.map(r=>r.o.id)),list=state.orders.filter(o=>ids.has(o.id));
 const extraFilters=orderExtraFilterLabels(f,company.id);
 const controls=`<div class="search-main dossier-search-main"><input id="search" type="search" aria-label="Zoek aanvragen en orders" placeholder="Zoek klant, order, product of specificatie…" value="${esc(f.text)}">${searchSelect('order','stage','Status',[['','Alle statussen'],...(company.id==='maatwerkkunststof'?[]:stages.map(v=>[v,v])),...['Onbetaald','Deels betaald','Betaald','Te veel ontvangen','Prijs nog onbekend','Verzendprijs nog onbekend','Geen bedrag'].map(v=>[v,v])],f.stage)}${f.mode==='prices'?'':searchSelect('order','sort','Sorteren',orderSortOptions,sort+':'+(ascending?'asc':'desc'))}</div><details class="search-details" data-search-details="orders" ${f.expanded?'open':''}><summary>${esc(extraFilterSummary(extraFilters,'Meer filters · maat, aantal en periode'))}</summary>${extraFilters.length?'<p class="form-help">Actief: '+esc(extraFilters.join(', '))+'</p>':''}<div class="search-fields">${searchSelect('order','visibility','Orders',[['active','Niet-gearchiveerd'],['all','Alles, inclusief archief'],['archived','Alleen gearchiveerd']],f.visibility)}${searchSelect('order','customerId','Klant',[['','Alle klanten'],...state.customers.map(c=>[c.id,c.company+(c.archived?' · archief':'')])],f.customerId)}${searchInput('order','width','Breedte (cm)','number',f.width,'min="0.1" step="0.1" placeholder="Bijv. 60"')}${searchInput('order','height','Hoogte (cm)','number',f.height,'min="0.1" step="0.1" placeholder="Bijv. 35"')}${company.id==='maatwerkkunststof'?searchInput('order','material','Materiaal','text',f.material||'','placeholder="Bijv. POM"')+searchInput('order','thickness','Dikte (mm)','number',f.thickness||'','min="0.001" max="1000000" step="any"'):''}${searchInput('order','quantity','Aantal stuks per productregel','number',f.quantity,'min="1" step="1"')}${company.id==='spatlappen'?searchInput('order','printColors','Aantal drukkleuren','number',f.printColors,'min="0" max="99" step="1" placeholder="Alle / onbekend"'):''}${searchSelect('order','tolerance','Vergelijken op maat en aantal',[['0','Exact'],['10','Tot 10% verschil'],['20','Tot 20% verschil']],f.tolerance)}${searchSelect('order','outcome','Offerte / akkoord',[['','Alle uitkomsten'],['accepted','Akkoord / betaling / uitvoering'],['pending','Nog geen akkoord'],['declined','Afgewezen'],['no_response','Geen reactie'],['unknown','Uitkomst onbekend']],f.outcome)}${searchInput('order','from','Aangevraagd vanaf','date',f.from)}${searchInput('order','to','Aangevraagd t/m','date',f.to)}</div>${button('clear-order-search','Filters wissen')}<p class="form-help">Maten in cm; aantallen zijn fysieke stuks per productregel. De filters moeten samen op hetzelfde product passen. Speling geldt voor maat en aantal${company.tool==='design'?'; drukkleuren blijven exact':''}. Leeg = geen filter; 0 drukkleuren = onbedrukt.</p></details>`;
 shell(heading('Aanvragen & orders','Alle aanvragen en orders, ook als aantallen of prijzen nog ontbreken.',button('new-order','Nieuwe klantorder','',true)+'<details class="quiet-menu"><summary>Meer</summary><div>'+button('ai-order','AI prompt')+'</div></details>')+`<div class="search-view-toggle" aria-label="Orderweergave"><button type="button" data-action="order-list-mode" data-id="orders" aria-pressed="${f.mode==='orders'}">Aanvragen & orders</button><button type="button" data-action="order-list-mode" data-id="prices" aria-pressed="${f.mode==='prices'}">Prijzen vergelijken</button></div><div class="panel">${funnelUI.summary()}${controls}${selection.visibility!==f.visibility?'<p class="form-help">De gekozen fase toont ook gearchiveerde dossiers.</p>':''}${f.sourceOrderId?`<p class="form-help">Vergelijken met <a href="#orders/${esc(f.sourceOrderId)}">order #${esc(order(f.sourceOrderId)?.sourceNumber||order(f.sourceOrderId)?.number||'—')}</a>. Deze order zelf staat niet tussen de resultaten.</p>`:''}${f.selectionLabel?`<p class="form-help">${esc(f.selectionLabel)} · ${f.orderIds.length} geselecteerde dossiers. Filters wissen toont weer alle dossiers.</p>`:''}<p class="search-result-count" role="status">${error?esc(error):`${list.length} aanvragen / orders · ${rows.filter(r=>r.item).length} passende productregels${f.mode==='prices'&&Number(f.tolerance)>0?' · beste overeenkomsten eerst':''}`}</p>${f.mode==='prices'?'<p class="form-help">Dit zijn de bewaarde orderprijzen, geen actuele prijslijst. Kijk bij Documenten voor het oorspronkelijke prijsvoorstel. Pakketprijzen worden niet verdeeld over producten. De uitkomst volgt geregistreerd akkoord, ontvangen betaling of voortgang; afwijzingen kun je bij Order bewerken vastleggen.</p>'+priceComparison(rows):'<p class="form-help">'+esc(dossierPreferences.help('orders',sort+':'+(ascending?'asc':'desc')))+'</p>'+ordersTable(sortedOrders(list))}</div>`,'orders',{facts:{orderCount:list.length,productMatchCount:rows.length},visible:{entity:'order',ids:(f.mode==='prices'?[...ids]:sortedOrders(list).map(o=>o.id)).slice(0,20),total:list.length}});
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 if(b.dataset.action==='clear-order-search'){funnelUI.reset();const mode=orderSearch.mode;orderSearch=defaultOrderSearch();orderSearch.mode=mode;if(mode==='prices'){orderSearch.visibility='all';orderSearch.expanded=true;}renderOrdersList();}
 else if(b.dataset.action==='clear-customer-search'){customerSearch=defaultCustomerSearch(dossierPreferences.customerSort());renderCustomersList();}
 else if(b.dataset.action==='compare-product'){const o=order(b.dataset.order),i=o?.items.find(i=>i.id===b.dataset.id);if(i){orderSearch={...defaultOrderSearch(),mode:'prices',visibility:'all',expanded:true,tolerance:'10',width:i.width?String(i.width/10):'',height:i.height?String(i.height/10):'',quantity:String(i.quantity),printColors:company.tool==='design'&&i.printColors!=null?String(i.printColors):'',...(company.id==='maatwerkkunststof'?{material:i.material||'',thickness:i.thickness>0?String(i.thickness):''}:{}),sourceOrderId:o.id};location.hash='orders';}}
 else if(b.dataset.action==='order-list-mode'){orderSearch.mode=b.dataset.id;if(orderSearch.mode==='prices'){orderSearch.visibility='all';orderSearch.expanded=true;}renderOrdersList();}
});
document.addEventListener('change',e=>{
 if(e.target.dataset.orderSearch){
  if(e.target.dataset.orderSearch==='sort'){
   if(!dossierPreferences.setOrderSort(e.target.value))return;
   const [key,direction]=e.target.value.split(':');sort=key;ascending=direction==='asc';
  }else orderSearch[e.target.dataset.orderSearch]=e.target.value;
  renderOrdersList();
 }
 else if(e.target.dataset.customerSearch){
  if(e.target.dataset.customerSearch==='sort'&&!dossierPreferences.setCustomerSort(e.target.value))return;
  customerSearch[e.target.dataset.customerSearch]=e.target.value;renderCustomersList();
 }
});
document.addEventListener('toggle',e=>{if(e.target.dataset.searchDetails==='orders')orderSearch.expanded=e.target.open;else if(e.target.dataset.searchDetails==='customers')customerSearch.expanded=e.target.open;},true);

function render(){const [page='dashboard',id]=route();if(page==='feedback'){shell('<div data-feedback-page><p>Feedback laden…</p></div>','feedback');void feedback.refresh();return;}if(page==='development'){shell(buildTasks.markup(),'development');buildTasks.mount($('#app'));return;}if(page==='order-map')return renderOrderMap();if(page==='analytics')return renderAnalytics();if(page==='payments')return paymentsWorkspace.render();if(page==='inventory'){shell(inventoryUI.markup(),'inventory',{facts:inventoryUI.facts()});return;}if(page==='purchases')return renderPurchases(id);if(page==='orders'&&id)return renderOrder(id);if(page==='customers'&&id)return renderCustomer(id);
if(page==='dashboard')renderDashboard();
else if(page==='orders')renderOrdersList();
else if(page==='customers')renderCustomersList();
else if(page==='designs')shell(heading(company.toolLabel,company.tool==='design'?'Ontwerpen bewaren bij de orderregel.':'Berekeningen bewaren bij de orderregel.')+`<div class="panel"><h2>${esc(company.toolLabel)}</h2><p>${company.tool==='design'?'Open de ontwerptool vanuit een orderregel. Ontwerp en voorbeeld blijven bij dat product bewaard.':'Gebruik dezelfde calculator als op GitHub. Vanuit een productregel kun je een berekening bewaren en gegevens bewust synchroniseren. Het aparte overzicht bevat je opgeslagen berekeningen en leveranciersoffertes. Er worden geen klantgegevens gekoppeld.'}</p><a class="badge blue" href="${esc(company.toolPath)}${runtime.mode==='cloud'?'?storage=cloud':''}" target="_blank" rel="noopener">Open ${esc(company.toolLabel)} ↗</a>${company.tool==='costing'?'<p><a class="download-button" href="/tools/costing/quotes.html" target="_blank" rel="noopener">Opgeslagen berekeningen & leveranciers →</a></p>':''}</div>`,'designs');
else if(page==='assistant')shell(assistant.markup(),'assistant');
else if(page==='mail')shell(heading('E-mail','Gmail-mails, klantgesprekken en concepten.')+inboxUI.markup(),'mail',{facts:{savedMailCount:state.incomingEmails?.length||0}});
else if(page==='settings')renderSettings();
else {location.hash='dashboard';}}
const documentCategories=[['quote','Offertes','Prijsvoorstellen voor de klant.'],['proforma','Proforma facturen','Proforma’s met een eigen PF-nummer.'],['confirmation','Orderbevestiging','De bevestiging van een klantorder.'],['invoice','Facturen','Facturen en eventuele creditnota’s.'],['packing','Pakbonnen','Geleverde aantallen en aflevergegevens, zonder prijzen.'],['other','Overige documenten',company.tool==='design'?'Ontwerpen, logo’s en andere bijlagen.':'Technische tekeningen, productbestanden en andere bijlagen.']];
const documentTargets=new Map();
const categoryPreferences=createCategoryPreferences(documentCategories.map(c=>c[0]),{companyId:company.id});

const documentCategory=d=>documentCategories.some(([key])=>key===d.category)?d.category:'other';

document.addEventListener('click',e=>{const b=e.target.closest('[data-action="delete-document"]');if(!b)return;try{deleteDocumentForm(b.dataset.id);}catch(error){toast(error.message);}});

document.addEventListener('click',e=>{const b=e.target.closest('[data-action="create-document"]');if(b){try{documentCreationForm(b.dataset.id,b.dataset.kind||'');}catch(error){toast(error.message);}}});

document.addEventListener('change',e=>{if(e.target.dataset.documentTarget){documentTargets.set(e.target.dataset.documentTarget,e.target.value);render();}});
installCategoryReorder(document,{preferences:categoryPreferences});
const savedDocumentPreview=createDocumentPreview({getFiles:()=>state.documents,readFile:id=>store('files','readonly',s=>s.get(id)),openForm});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action="preview-document"]');if(b)void savedDocumentPreview.open(b.dataset.id).catch(error=>toast(error.message));});
window.addEventListener('pagehide',()=>savedDocumentPreview.dispose());

let pendingSearchResult=null;
const globalSearch=createWorkspaceSearch({getState:()=>state,company,
 canNavigate:dialog=>!deliveryDrafts.size&&!hasActiveFormEdits(document)&&![...document.querySelectorAll('dialog[open]')].some(d=>d!==dialog),
 navigate:result=>{pendingSearchResult=result;if(location.hash===result.href){render();revealSearchResult();}else location.hash=result.href;}
});
function revealSearchResult(){
 const result=pendingSearchResult;if(!result)return;pendingSearchResult=null;
 if(result.target.mailId){void inboxUI.openSearchMail(result.target.mailId).catch(e=>toast(e.message));return;}
 const selectors=result.target.documentId?['[data-document-id="'+CSS.escape(result.target.documentId)+'"]']:result.target.paymentId?['[data-payment-id="'+CSS.escape(result.target.paymentId)+'"]']:result.target.stockId?['[data-stock-row="'+CSS.escape(result.target.stockId)+'"]']:[];
 const node=selectors.map(s=>document.querySelector(s)).find(Boolean);if(node){node.tabIndex=-1;node.classList.add('search-target');node.scrollIntoView({block:'center'});node.focus({preventScroll:true});}else document.querySelector('main h1')?.scrollIntoView({block:'start'});
}
const customerViews=createCustomerViews({dossierPreferences,company,esc,button,badge,euro,date,heading,searchSelect,guidanceMarkup,documentVersionGroups,customerWithSources,provenanceText,ordersTable,sortedOrders,customerAddressSummary,customerAddresses,documents,documentsForOwner,inboxUI});

document.addEventListener('click',e=>{const b=e.target.closest('[data-action=customer-tab]');if(b)selectCustomerTab(b.dataset.id);});

function economics(o){
 const p=purchase(o.purchaseId),info=p?purchaseInfo(p):null,product=o.items.reduce((sum,i)=>sum+itemCostTotal(i),0),duty=p?null:dutyAmount(o),shared=p?allocatedCost(p,o.id):0;
 const missing=o.items.filter(i=>i.cost==null).map(i=>`inkoop ${i.description}`);if(!totals(o).priceKnown)missing.push('verkoopprijs van de producten');
 if(o.shippingActual==null)missing.push('verzending Nederland → klant');if(o.extraCosts==null)missing.push('overige orderkosten');
 if(p){missing.push(...info.missingShared);if(p.allocation==='cost'&&!info.goodsKnown)missing.push('inkoopwaarden voor de verdeling');}else if(duty==null)missing.push('invoerrechten');
 const named=namedCostSummary(o);if(!named.known)missing.push('benoemde extra kosten');
 const cost=named.total+product+(o.shippingActual??0)+(o.extraCosts??0)+(duty??0)+shared,revenue=totals(o).net,estimated=(p?p.dutyMode:o.dutyMode)==='calculate',known=missing.length===0;
 return {known,missing:[...new Set(missing)],estimated,provisional:!known||estimated||!o.shippingKnown,namedTotal:named.total,product,cost,shared,duty,profit:revenue-cost,margin:revenue?((revenue-cost)/revenue*100):0};
}

const percent = n => `${new Intl.NumberFormat('nl-NL',{maximumFractionDigits:1}).format(n)}%`;
const signedEuro = n => (n>0?'+':'')+euro(n);

async function createRelated(form,kind){
 const definitions={
  customer:{title:'Klant aanmaken',html:`${field('company','Naam / bedrijf',form.elements.newCustomerName?.value||'','text','required')}${field('contact','Contactpersoon',form.elements.newCustomerContact?.value||'')}${field('email','E-mail',form.elements.newCustomerEmail?.value||'','email')}${field('phone','Telefoon',form.elements.newCustomerPhone?.value||'')}`,collection:'customers',select:'customerId',label:c=>c.company+(c.archived?' (gearchiveerd)':'')},
  purchase:{title:'Inkoopbestelling aanmaken',html:`${field('name','Naam / referentie',form.elements.newPurchaseName?.value||'','text','required')}${field('supplier','Leverancier',form.elements.newPurchaseSupplier?.value||'')}`,collection:'purchases',select:'purchaseId',label:p=>p.name+' · '+p.supplier}
 };
 const definition=definitions[kind];if(!definition)throw Error('Deze maakactie is niet beschikbaar.');
 const result=await openInlineFormTask({title:definition.title,html:definition.html,focus:kind==='customer'?'company':'name',onSubmit:async(fd,child,useExisting)=>{
  const values=Object.fromEntries([...fd].map(([key,v])=>[key,String(v).trim()]));const key=kind==='customer'?'company':'name';if(!values[key])throw formProblem('Vul dit veld in.',{field:key});
  const record=kind==='customer'?{...Object.fromEntries(customerKeys.map(k=>[k,''])),...values,id:uid(),country:'Nederland',archived:false}:{id:uid(),...values,allocation:'equal',status:'Verzamelen',freight:null,extraCosts:null,dutyMode:'fixed',dutyAmount:null};
  const id=await mergeStoredState(next=>{const duplicate=next[definition.collection].find(c=>kind==='customer'?String(c.company||'').trim().toLowerCase()===values.company.toLowerCase()||values.email&&c.email?.toLowerCase()===values.email.toLowerCase():String(c.name||'').trim().toLowerCase()===values.name.toLowerCase()&&c.supplier?.trim().toLowerCase()===values.supplier.toLowerCase());if(duplicate)throw formProblem(kind==='customer'?'Deze klant bestaat al. Kies de bestaande klant of gebruik een andere naam.':'Deze inkoopbestelling bestaat al. Kies de bestaande bestelling of gebruik een andere naam.',{field:key,action:{label:'Bestaande '+(kind==='customer'?'klant':'inkoopbestelling')+' kiezen',run:()=>useExisting(duplicate.id)}});next[definition.collection].push(record);next.activities.unshift({id:uid(),message:definition.title+' vanuit een keuzelijst',time:new Date().toISOString()});return record.id;});render();return id;
 }});
 if(!result||!form.isConnected)return;const record=state[definition.collection].find(r=>r.id===result),select=form.elements.namedItem(definition.select);if(!record||!select)return;
 let option=[...select.options].find(o=>o.value===result);if(!option){option=document.createElement('option');option.value=result;option.textContent=definition.label(record);select.append(option);}select.value=result;select.dispatchEvent(new Event('change',{bubbles:true}));
 const notice=form.querySelector('[data-related-notice]');if(notice)notice.textContent=definition.title.replace(' aanmaken','')+' geselecteerd. Je eerdere invoer is behouden; sla dit formulier zelf op.';
}
function openForm(title,html,onSubmit,options={}){
 const d=$('#dialog');d.innerHTML=`<form><div class="dialog-heading"><h2>${title}</h2><button type="button" class="feedback-form-button" data-feedback-action="start">Feedback melden</button></div><div class="dialog-body"><p id="form-status" class="form-status" role="status" hidden></p>${html}</div><p id="form-error" class="danger" role="alert" tabindex="-1"></p><div class="dialog-footer actions"><button type="button" id="cancel">Annuleren</button><button class="primary" type="submit">Opslaan</button></div></form>`;
 const form=d.querySelector('form');installFormGuidance(form);let dirty=false,busy=false;form.addEventListener('input',()=>{if(options.trackChanges!==false)dirty=true;});form.addEventListener('change',()=>{if(options.trackChanges!==false)dirty=true;});
 // Feature actions such as attachment uploads share the same modal boundary.
 const formBusy=()=>busy||form.inert||form.getAttribute('aria-busy')==='true';
 const canClose=()=>!formBusy()&&(!dirty||confirm('Je wijzigingen zijn nog niet opgeslagen. Wil je ze weggooien?'));
 const cancelForm=()=>{if(canClose()){d.close();options.afterCancel?.();}};$('#cancel').onclick=cancelForm;d.oncancel=e=>{e.preventDefault();cancelForm();};
 function showError(problem){showFormProblem(form,problem,{toast,isBusy:formBusy});}
 form.onsubmit=async event=>{
  event.preventDefault();if(formBusy())return;
  const status=form.querySelector('#form-status');status.hidden=true;form.querySelector('#form-error').textContent='';
  if(!validateForm(form,{toast,isBusy:formBusy}))return;
  const b=form.querySelector('[type=submit]'),cancel=form.querySelector('#cancel'),submitLabel=b.textContent,previousToast=toastSequence;
  const previousInert=form.inert;
  let completed=false,failed=false;busy=true;form.inert=true;b.disabled=true;b.textContent=form.dataset.busyLabel||'Bezig met opslaan…';cancel.disabled=true;
  const finishLoading=loading.begin(b.textContent);
  status.textContent=b.textContent;status.hidden=false;form.setAttribute('aria-busy','true');
  try{
   const result=await onSubmit(new FormData(form));
   if(result!==false){completed=true;dirty=false;d.close();if(toastSequence===previousToast&&/opslaan|bewaren|aanmaken/i.test(submitLabel))toast('Opgeslagen');}
  }catch(error){failed=true;form.inert=previousInert;showError(error);}
  finally{finishLoading({error:failed});busy=false;form.inert=previousInert;b.disabled=false;b.textContent=submitLabel;cancel.disabled=false;status.hidden=true;form.removeAttribute('aria-busy');}
  if(completed)options.afterSave?.();
 };
 for(const box of form.querySelectorAll('[data-inline-customer],[data-inline-purchase]'))for(const input of box.querySelectorAll('input'))input.disabled=box.hidden;
 for(const button of form.querySelectorAll('[data-create-related]'))button.onclick=()=>runGuidedAction(button,()=>createRelated(form,button.dataset.createRelated),{isBusy:formBusy,pendingLabel:'Maakvenster openen…',onError:showError});
 if(form.querySelector('[name=packagePrice]'))updatePackagePricing(form);d.showModal();if(options.focus)focusFormField(form,options.focus,{invalid:false});
}

installPrimaryImage({company,getState:()=>state,mergeStoredState,render,toast});
installCustomerNumberSettings({getState:()=>state,openForm,mergeStoredState,render,toast,esc});

document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;try{const {action,id,order:orderId}=b.dataset;if(action==='upload-product-image')uploadProductImage(orderId,id);else if(action==='view-product-image')viewProductImage(id);else if(action==='approve-product-image')await markProductImage(id,true);else if(action==='unapprove-product-image')await markProductImage(id,false);}catch(error){toast(error.message);}});

document.addEventListener('change',e=>{if(e.target.name==='measurementUnknown')updateItemMeasurements(e.target.closest('.item'));});

document.addEventListener('change',e=>{if(e.target.name==='createOrder'||e.target.name==='customerId'&&e.target.form?.querySelector('[data-order-fields]'))updateCombinedOrderForm(e.target.form);});

const openPaymentCorrection=createPaymentCorrectionUI({getState:()=>state,openForm,mergeStoredState,render,toast,euro,esc});

let documentUploadQueue=Promise.resolve();

const isFileDrag=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');

document.addEventListener('dragover',e=>{
 if(!isFileDrag(e))return;e.preventDefault();const zone=e.target.closest('[data-drop-owner]');
 e.dataTransfer.dropEffect=zone?'copy':'none';clearDropHighlights();zone?.classList.add('drag-over');
});
document.addEventListener('dragleave',e=>{const zone=e.target.closest('[data-drop-owner]');if(zone&&(!e.relatedTarget||!zone.contains(e.relatedTarget)))zone.classList.remove('drag-over');});
document.addEventListener('dragend',clearDropHighlights);
document.addEventListener('drop',e=>{
 if(!isFileDrag(e))return;e.preventDefault();clearDropHighlights();
 const zone=e.target.closest('[data-drop-owner]');
 if(zone)addDocuments(zone.dataset.dropOwner,zone.dataset.dropCategory,e.dataTransfer.files,zone.dataset.dropItem?{itemId:zone.dataset.dropItem,imageRole:'reference'}:{}).catch(error=>toast('Upload mislukt: '+error.message));
});
document.addEventListener('change',async e=>{
 const id=e.target.dataset.documentCategory;if(!id)return;
 const d=state.documents.find(d=>d.id===id),category=e.target.value;
 if(!d||!documentCategories.some(([key])=>key===category))return;
 const basis=JSON.stringify(d),select=e.target,message='Document verplaatst naar '+documentCategories.find(([key])=>key===category)[1].toLowerCase();select.disabled=true;
 try{
  await mergeStoredState(next=>{const current=next.documents.find(document=>document.id===id);if(JSON.stringify(current)!==basis)throw Error('Dit document is intussen gewijzigd. Open het opnieuw voordat je het verplaatst.');current.category=category;next.activities.unshift({id:uid(),message,time:new Date().toISOString()});});
  render();toast(message);
 }catch(error){select.value=d.category;toast('Verplaatsen mislukt: '+error.message);}finally{select.disabled=false;}
});

function orderInvoiceLinks(data,o){
 const items=new Set(o.items.map(i=>i.id));
 return data.purchases.flatMap(p=>supplierInvoices(p).filter(invoice=>(invoice.lines||[]).some(line=>line.orderId===o.id||items.has(line.itemId))).map(invoice=>({p,invoice})));
}
function documentPaymentActions(d,{includeEmail=true}={}){
 if(d.supplierDocument)return '';
 if(order(d.ownerId)&&documentCategory(d)==='packing')return includeEmail?`<button type="button" data-action="email-draft" data-id="${esc(d.ownerId)}" data-document="${esc(d.id)}">E-mail voorbereiden</button>`:'';
 if(!order(d.ownerId)||!['quote','confirmation','proforma','invoice'].includes(documentCategory(d)))return '';
 return `<button type="button" data-action="make-payment-link" data-id="${esc(d.ownerId)}" data-document="${esc(d.id)}">Betaallink maken</button>${includeEmail?`<button type="button" data-action="email-draft" data-id="${esc(d.ownerId)}" data-document="${esc(d.id)}">E-mail voorbereiden</button>`:''}`;
}
function orderMailHistory(o){
 const drafts=[...(o.emailDrafts||[])].reverse();if(!drafts.length)return '';
 return `<details class="mail-order-history"><summary>Mailhistorie · ${drafts.length} bericht${drafts.length===1?'':'en'}</summary>${drafts.map(d=>`<article class="mail-history-row"><div><strong>${esc(d.subject)}</strong><small>${esc(d.to)} · ${esc(mailStatusLabel(d.status))}${d.sentAt?' · '+esc(new Date(d.sentAt).toLocaleString('nl-NL',{timeZone:CRM_TIME_ZONE})):''}</small>${d.lastError?`<small>${esc(d.lastError)}</small>`:''}</div><button type="button" data-action="email-draft" data-id="${esc(o.id)}" data-draft="${esc(d.id)}">${d.status==='accepted'?'Bekijken / hergebruiken':'Concept openen'}</button></article>`).join('')}</details>`;
}
function paymentLinksPanel(o){
 const links=o.paymentLinks||[];
 return `<section class="order-surface payment-links-panel"><div class="section-heading"><div><h2>Betaallinks</h2><p>Een aanbetaling of restant aanvragen.</p></div></div><div class="actions">${button('make-payment-link','Betaallink maken',o.id,true)}${links.length?button('check-tikkie-payments','Betalingen controleren',o.id):''}</div>${links.map(l=>`<article class="saved-payment-link"><div><strong>${euro(l.amountInCents)} incl. btw</strong><span>${esc(l.description)}</span>${paymentLinkReceipt(l)}<small>Gemaakt ${date(l.createdAt.slice(0,10))} · geldig t/m ${date(l.expiryDate)}${l.expiryDate<today()?' · verlopen':''}</small></div><div class="actions"><a class="download-button" href="${esc(safePaymentUrl(l.url))}" target="_blank" rel="noopener">Link openen ↗</a><button type="button" data-action="copy-payment-link" data-id="${o.id}" data-link="${esc(l.id)}">Kopiëren</button><button type="button" data-action="email-draft" data-id="${o.id}" data-link="${esc(l.id)}" data-document="${esc(l.documentId||'')}">E-mail voorbereiden</button></div></article>`).join('')}<details class="form-details"><summary>E-mail & eerdere verzendingen</summary><div class="actions">${button('email-draft','E-mail openen',o.id)}<button type="button" data-action="email-draft" data-id="${esc(o.id)}" data-new-mail>Nieuwe mail / gegevens opvragen</button>${button('invoice-mail-start','Factuurmail voorbereiden',o.id)}</div>${orderMailHistory(o)}</details><p class="form-help">Gewone bankoverboekingen registreer je zelf. Met een actieve online Tikkie-koppeling kan de server elke vijftien minuten automatisch controleren. Betalingen controleren haalt de laatste stand direct op. Controleer de automatische status bij Instellingen → Telefoon & meldingen. Er wordt geen mail automatisch verstuurd.</p></section>`;
}

function safePaymentUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='tikkie.me'?u.href:'#';}catch{return '#';}}
function paymentLinkReceipt(link){
 if(!link.checkedAt)return '<small>Nog niet gecontroleerd bij Tikkie</small>';
 const paid=link.paidInCents||0,total=link.amountInCents;
 const label=paid>=total?'Betaald':paid>0?'Deels betaald':'Nog geen betaling gemeld';
 const time=new Date(link.checkedAt).toLocaleString('nl-NL',{timeZone:CRM_TIME_ZONE,dateStyle:'short',timeStyle:'short'});
 return `<div>${badge(label,paid>=total?'green':paid>0?'orange':'blue')} <strong>${euro(paid)}</strong> ontvangen via deze link</div><small>Gecontroleerd ${esc(time)}${link.status==='CLOSED'?' · link gesloten':''}</small>`;
}
async function checkTikkiePayments(id,button){
 // The shared click handler already owns the busy lock and disables this button.
 const label=button.textContent;button.disabled=true;button.textContent='Tikkie controleren…';
 let added=0;
 try{
  beginLocalStateChange();
  const response=await fetch('/__local/tikkie/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:id})});
  const result=await response.json().catch(()=>({error:'Start de lokale CRM-server opnieuw om Tikkie-betalingen te controleren.'}));
  if(!response.ok||result.error)throw Error(result.error||'Tikkie kon niet worden gecontroleerd.');
  if(!Array.isArray(result.links))throw Error('Tikkie gaf geen geldige controle terug.');
  await updateCommunication(id,(o,next)=>{added=applyTikkiePayments(next,o,result.links,{uid,timeZone:CRM_TIME_ZONE});},'Tikkie-betalingen gecontroleerd',true);
  toast(added?`${added} Tikkie-betaling${added===1?'':'en'} toegevoegd aan deze order`:'Tikkie gecontroleerd · geen nieuwe betalingen');
 }finally{button.disabled=false;button.textContent=label;}
}
// Read the latest stored order inside the transaction, preserving changes from other tabs.
async function updateCommunication(id,mutate,message,afterExternalCall=false){
 if(afterExternalCall)externalRefreshSeq++;else beginLocalStateChange();
 let next;
 await new Promise((resolve,reject)=>{
  const tx=db.transaction('state','readwrite'),ss=tx.objectStore('state'),r=ss.get('main');
  r.onsuccess=()=>{try{next=r.result;if(!next)throw Error('CRM-gegevens ontbreken.');const owner=mailOwner(next,id);if(!owner)throw Error('Dit klantdossier bestaat niet meer.');mutate(owner.record,next);next.activities.unshift({id:uid(),message,time:new Date().toISOString()});ss.put(next,'main');}catch(error){tx.abort();reject(error);}};
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Opslaan afgebroken.'));
 });
 state=next;pendingExternalRefresh=false;notifyDataChanged();render();toast(message);
}
async function preparePaymentLink(id,documentId='',options={}){
 if($('#dialog').open)return;
 const o=order(id);if(!o)throw Error('Deze order bestaat niet meer.');
 const response=await fetch(`/__local/tikkie/requests?orderId=${encodeURIComponent(id)}`,{cache:'no-store'});
 if(!response.ok)throw Error('Start de lokale CRM-server opnieuw om Tikkie te gebruiken.');
 const saved=await response.json(),missing=saved.links.filter(l=>!(order(id)?.paymentLinks||[]).some(x=>x.id===l.id));
 if(missing.length){await updateCommunication(id,current=>{current.paymentLinks??=[];for(const link of missing)if(!current.paymentLinks.some(l=>l.id===link.id))current.paymentLinks.push(link);},'Bestaande Tikkie-betaallink teruggevonden en opgeslagen',true);const recovered=missing.find(l=>documentId?l.documentId===documentId:true);if(options.onCreated&&recovered){await options.onCreated(recovered);return;}if(!options.onCreated)return;}
 if(saved.pending)throw Error('Een eerder verzoek heeft nog geen zeker antwoord van Tikkie. Controleer eerst je Tikkie-portaal; er wordt geen tweede link gemaakt.');
 if($('#dialog').open)return;
 paymentLinkForm(id,documentId,options);
}
function paymentLinkForm(id,documentId='',options={}){
 const o=order(id),t=totals(o),d=state.documents.find(x=>x.id===documentId&&x.ownerId===id),basis=paymentBasis(o,d,t.total),signature=confirmationSignature(state,id),requestId=uid();
 const end=new Date(today()+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+14);const expiry=end.toISOString().slice(0,10);
 let sentPayload=null,createdLink=null;const initialAmount=t.balance>0?t.balance:basis;const initialPercentage=basis>0?initialAmount/basis*100:null;
 openForm('Betaallink maken',`<p class="form-help">${esc(customer(o.customerId)?.company)} · order #${esc(o.sourceNumber||o.number)}${d?`<br>Bij document: ${esc(d.name)}`:''}</p><div class="payment-kpis"><div><span>${d?.generated?.payload?'Document':'Order'} incl. btw</span><strong>${euro(basis)}</strong></div><div><span>Ontvangen incl. btw</span><strong>${euro(t.paid)}</strong></div><div><span>Nog te ontvangen incl. btw</span><strong>${euro(Math.max(0,t.balance))}</strong></div></div><section class="form-section"><h3>Hoeveel wil je laten betalen?</h3><div class="fields">${field('percentage','Percentage van totaal incl. btw',basis>0?Number(initialPercentage.toFixed(6)):'','number',basis>0?'required min="0.000001" step="any"':'disabled')}${field('amount','Bedrag incl. btw (€)',(initialAmount/100).toFixed(2),'number','required min="0.01" step="0.01"')}</div><div class="actions payment-presets">${[25,30,50,70,100].map(v=>`<button type="button" data-payment-percent="${v}">${v}%</button>`).join('')}<button type="button" id="payment-use-balance">Openstaand bedrag gebruiken</button></div><div class="payment-request-total"><span>Deze betaallink incl. btw</span><strong id="payment-amount-preview">${euro(initialAmount)}</strong></div><p id="payment-amount-warning" class="form-help" role="status"></p></section><div class="fields">${field('description','Omschrijving op Tikkie',`Order ${o.sourceNumber||o.number} ${company.name}`.slice(0,35),'text','required maxlength="35"')}${field('expiryDate','Geldig t/m',expiry,'date',`required min="${today()}"`)}</div>${!t.priceKnown?'<p class="form-help">De verkoopprijzen zijn nog niet volledig ingevuld. Controleer het bedrag dat je met deze betaallink wilt vragen.</p>':''}<p class="form-help">Je maakt een echte Tikkie voor het bedrag hierboven. De klant krijgt pas een bericht nadat je de link deelt. Je kunt voor een latere restbetaling een nieuwe link maken.</p>${(o.paymentLinks||[]).length?'<p class="notice">Deze order heeft al een betaallink. Bestaande links blijven geldig tot hun vervaldatum.</p>':''}`,async fd=>{
  const paymentForm=$('#dialog form'),invalid=[...paymentForm.elements].find(input=>input.willValidate&&!input.validity.valid);
  if(invalid){invalid.focus();throw Error(`Controleer ${invalid.labels?.[0]?.textContent.trim()||'het ingevulde veld'}: ${invalid.validationMessage}`);}
  const amount=cents(fd.get('amount')),percentage=Number(fd.get('percentage'));
  if(!Number.isSafeInteger(amount)||amount<=0||basis>0&&(!Number.isFinite(percentage)||percentage<=0))throw formProblem('Vul een geldig bedrag en percentage in.',{field:'amount'});
  const payload={requestId,orderId:id,documentId:d?.id||'',amountInCents:amount,description:fd.get('description').trim(),expiryDate:fd.get('expiryDate')};
  if(sentPayload&&JSON.stringify(payload)!==sentPayload)throw Error('Dit verzoek is al verstuurd. Gebruik dezelfde gegevens om het resultaat op te slaan, of open het formulier opnieuw.');
  if(!createdLink){
   beginLocalStateChange();const latest=await store('state','readonly',s=>s.get('main'));
   if(signature!==confirmationSignature(latest,id)||d&&JSON.stringify(latest.documents.find(x=>x.id===d.id))!==JSON.stringify(d))throw Error('De order of bijlage is ondertussen veranderd. Open Betaallink maken opnieuw om het actuele bedrag te gebruiken.');
   if(!sentPayload&&amount>Math.max(0,t.balance)){
    const message=t.balance<=0?`Deze order is al volledig betaald. Je maakt toch een nieuwe betaallink van ${euro(amount)}.`:`Er staat ${euro(t.balance)} open. Je maakt een betaallink van ${euro(amount)}, dus ${euro(amount-t.balance)} meer dan het restant.`;
    if(!confirm(`${message}\n\nToch doorgaan? Er wordt nog geen bericht naar de klant verstuurd.`))return false;
   }
   paymentForm.querySelector('[type=submit]').textContent='Tikkie wordt aangemaakt…';
   sentPayload=JSON.stringify(payload);
   const response=await fetch('/__local/tikkie/create',{method:'POST',headers:{'Content-Type':'application/json'},body:sentPayload}).catch(()=>{throw Error('De verbinding is onderbroken. Open Betaallink maken opnieuw om een eventueel aangemaakte link terug te vinden.');});
   const result=await response.json().catch(()=>({error:'Geen zeker antwoord ontvangen. Open Betaallink maken opnieuw om een eventueel aangemaakte link terug te vinden.'}));
   if(!response.ok||result.error)throw Error(result.error||'Tikkie kon niet worden aangemaakt.');
   createdLink={...result,basisTotal:basis,percentage:basis>0?amount/basis*100:null};
  }
  await updateCommunication(id,current=>{current.paymentLinks??=[];if(!current.paymentLinks.some(l=>l.id===createdLink.id))current.paymentLinks.push(createdLink);},'Tikkie-betaallink aangemaakt',true);
  setTimeout(()=>{Promise.resolve(options.onCreated?options.onCreated(createdLink):paymentLinkResult(id,createdLink)).catch(error=>toast(error.message));},0);
 },{afterCancel:options.onCancel});
 const form=$('#dialog form'),amount=form.elements.amount,percentage=form.elements.percentage;
 // Surface validation in our own error box instead of silently stopping before onsubmit.
 form.noValidate=true;
 form.dataset.busyLabel='Gegevens controleren…';
 form.addEventListener('invalid',event=>{const box=form.querySelector('#form-error');box.textContent=`Controleer ${event.target.labels?.[0]?.textContent.trim()||'het ingevulde veld'}: ${event.target.validationMessage}`;},true);
 const refresh=()=>{
  const n=cents(amount.value),warning=form.querySelector('#payment-amount-warning');
  const problem=!Number.isSafeInteger(n)||n<=0?'Vul een bedrag groter dan €0,00 in.':t.balance<=0?'Deze order is al volledig betaald. Je kunt toch een nieuwe betaallink maken; we vragen je dan om bevestiging.':n>t.balance?`Er staat nog ${euro(t.balance)} open. Je kunt een hoger bedrag vragen; we vragen je dan om bevestiging.`:'';
  form.querySelector('#payment-amount-preview').textContent=Number.isSafeInteger(n)?euro(n):'—';
  warning.textContent=problem||`Na deze betaling resteert ${euro(Math.max(0,t.balance-n))}.`;
  warning.className=problem?'danger':'form-help';
  form.querySelector('#form-error').textContent='';
 };
 percentage.addEventListener('input',()=>{amount.value=(requestedAmount(basis,decimalNumber(percentage.value))/100).toFixed(2);refresh();});
 amount.addEventListener('input',()=>{const value=basis>0?cents(amount.value)/basis*100:0;percentage.value=basis>0?value.toFixed(value>0&&value<0.005?6:2):'';refresh();});
 form.addEventListener('click',event=>{const b=event.target.closest('[data-payment-percent]');if(b){percentage.value=b.dataset.paymentPercent;percentage.dispatchEvent(new Event('input',{bubbles:true}));}});
 $('#payment-use-balance').onclick=()=>{amount.value=(Math.max(0,t.balance)/100).toFixed(2);amount.dispatchEvent(new Event('input',{bubbles:true}));};
 $('#dialog [type=submit]').textContent='Tikkie aanmaken';
 refresh();
}
function paymentLinkResult(id,link){
 openForm('Betaallink klaar',`<p><strong>${euro(link.amountInCents)}</strong> · geldig t/m ${date(link.expiryDate)}</p>${field('url','Betaallink',link.url,'url','readonly')}<div class="actions"><button type="button" id="result-copy-link">Link kopiëren</button><a href="${esc(safePaymentUrl(link.url))}" target="_blank" rel="noopener" class="download-button">Tikkie openen ↗</a></div><p class="form-help">De link is opgeslagen bij de order. Zet hem nu in een e-mailconcept, of deel hem zelf.</p>`,async()=>{setTimeout(()=>emailDraftForm(id,link.documentId,link.id).catch(error=>toast(error.message)),0);});
 $('#dialog [type=submit]').textContent='E-mail voorbereiden';$('#cancel').textContent='Sluiten';$('#result-copy-link').onclick=()=>copyCommunication(link.url);
}
async function copyCommunication(text){try{await navigator.clipboard.writeText(text);toast('Gekopieerd');}catch{toast('Kopiëren is geblokkeerd. Selecteer de tekst en kopieer deze zelf.');}}

document.addEventListener('click',async event=>{
 const b=event.target.closest('[data-action]');if(!b)return;
 const {action,id,document:documentId,link:linkId}=b.dataset,label=({'make-payment-link':'Betaallink voorbereiden…','check-tikkie-payments':'Betalingen controleren…','email-draft':'E-mail openen…','invoice-mail-start':'Factuurmail openen…'})[action],key=JSON.stringify([action,id,documentId,linkId,b.dataset.draft]);if(label&&loading.isBusy(key))return;const finishLoading=label?loading.begin(label,{key,button:b}):null;let failed=false;
 try{
  if(action==='make-payment-link')await preparePaymentLink(id,documentId);
  if(action==='check-tikkie-payments')await checkTikkiePayments(id,b);
  if(action==='invoice-mail-start')await startInvoiceMail(id);
  if(action==='email-draft')await emailDraftForm(id,documentId,linkId,b.dataset.draft||'',b.hasAttribute('data-new-mail')?{newMail:true}:{});
  if(action==='copy-payment-link'){const link=order(id)?.paymentLinks?.find(l=>l.id===linkId);if(link)await copyCommunication(link.url);}
 }catch(error){failed=true;toast(error.message);}finally{finishLoading?.({error:failed});}
});
function deleteOrderForm(id){
 if(vatProtectedOrder(state,id))throw Error('Deze order heeft een btw-boeking of bewaarde voorbereiding. Archiveer de order; behoud de fiscale bron en historie.');
 const o=order(id);if(!o)throw Error('Deze order bestaat niet meer.');
 const payments=state.payments.filter(p=>p.orderId===id),files=state.documents.filter(d=>d.ownerId===id),links=orderInvoiceLinks(state,o),label=o.sourceNumber||o.number;
 openForm('Order definitief verwijderen',`<p><strong>Order #${esc(label)} · ${esc(customer(o.customerId)?.company)}</strong></p>${links.length?`<p class="notice">Deze order is gekoppeld aan een leveranciersdocument. Haal eerst de productkoppeling uit dat document voordat je de order verwijdert. De leveranciersfactuur en betalingen blijven behouden.</p>${links.map(({p,invoice})=>`<p><a href="#purchases/${p.id}/invoices" data-action="close-delete-dialog">${esc(invoice.reference)} openen →</a></p>`).join('')}`:`<p>Je verwijdert deze order, ${payments.length} bijbehorende betaling${payments.length===1?'':'en'} en ${files.length} orderbestand${files.length===1?'':'en'}.</p><p>De klant, andere orders en algemene klantdocumenten blijven behouden. De order verdwijnt ook uit de planning en analytics.</p>${(o.paymentLinks||[]).length?'<p class="notice">Tikkie-links blijven actief bij Tikkie. Beheer die in je Tikkie-portaal; verwijderen uit het CRM trekt geen betaalverzoek in.</p>':''}<p class="danger">Binnen dit tabblad kun je deze verwijdering herstellen met Stap terug (max. 20 stappen / 16 MB). Bij grotere wijzigingen of na herladen heb je een back-up nodig.</p><label class="check-row"><input type="checkbox" name="confirmDelete" required>Ik wil deze order definitief verwijderen</label>`}`,async fd=>{
 if(!fd.has('confirmDelete'))throw formProblem('Bevestig dat je deze order wilt verwijderen.',{field:'confirmDelete'});
 beginLocalStateChange();
 let next,removed=[];
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),request=ss.get('main');
  request.onsuccess=()=>{try{
   next=request.result;if(!next)throw Error('CRM-gegevens ontbreken.');next.purchases??=[];
   const current=next.orders.find(o=>o.id===id);if(!current)throw Error('Deze order is al verwijderd.');
   if(orderInvoiceLinks(next,current).length)throw Error('Deze order is gekoppeld aan een leveranciersdocument. Haal eerst die productkoppeling weg.');
   if(vatProtectedOrder(next,id))throw Error('Deze order is inmiddels in het btw-register opgenomen. Archiveer haar in plaats van definitief verwijderen.');
   const currentFiles=next.documents.filter(d=>d.ownerId===id),currentPayments=next.payments.filter(p=>p.orderId===id);
   if(JSON.stringify(current)!==JSON.stringify(o)||JSON.stringify(currentFiles)!==JSON.stringify(files)||JSON.stringify(currentPayments)!==JSON.stringify(payments))throw Error('De order is ondertussen gewijzigd. Open Verwijderen opnieuw om de actuele gegevens te controleren.');
   removed=currentFiles.map(d=>d.id);next.orders=next.orders.filter(o=>o.id!==id);next.payments=next.payments.filter(p=>p.orderId!==id);next.documents=next.documents.filter(d=>d.ownerId!==id);
   const client=next.customers.find(c=>c.id===current.customerId);if(client){if(client.shippingAddressOrderId===id)delete client.shippingAddressOrderId;const remaining=next.orders.filter(o=>o.customerId===client.id);if(remaining.length===1&&remaining[0].delivery?.source==='custom'){const other=remaining[0];Object.assign(client,{shippingAddress:other.delivery.address||'',shippingRecipient:other.delivery.recipient||'',shippingCountry:other.delivery.country||'',shippingAddressOrderId:other.id});}}
   // Keep local import markers so deleted imported orders do not return on reload.
   next.activities.unshift({id:uid(),message:`Order #${label} definitief verwijderd`,time:new Date().toISOString()});
   ss.put(next,'main');for(const fileId of removed)if(!next.documents.some(d=>d.id===fileId))tx.objectStore('files').delete(fileId);
  }catch(error){tx.abort();reject(error);}};
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Verwijderen afgebroken.'));
 });
 state=next;for(const fileId of removed){documentImageUrls.get(fileId)?.then(url=>URL.revokeObjectURL(url)).catch(()=>{});documentImageUrls.delete(fileId);}deliveryDrafts.delete(id);orderView={id:'',tab:'overview'};notifyDataChanged();location.hash='orders';render();toast('Order en bijbehorende betalingen en bestanden verwijderd');
 });
 const submit=$('#dialog [type=submit]');submit.textContent='Definitief verwijderen';submit.className='destructive';submit.disabled=links.length>0;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='delete-order'){try{deleteOrderForm(b.dataset.id);}catch(error){toast(error.message);}}if(b.dataset.action==='close-delete-dialog')$('#dialog').close();});

async function exportBackup(){
 const data=runtime.mode==='local'?await readBrowserPackage():await readCloudPackage(db);
 if(!editingLocally()){state=data.state;state.orders.forEach(syncSingleOrderDelivery);render();}
 if(await downloadBlob(await backupBlob(data),`crm-backup-${today()}.json`))toast('Volledige back-up downloaden gestart · kijk in Downloads');
}
async function importBackup(){
 const input=document.createElement('input');input.type='file';input.accept='.json';
 input.onchange=async()=>{const finishLoading=loading.begin('Back-up controleren en terugzetten…');let failed=false;try{
  const b=await parseBackup(input.files[0],{companyId:company.id});feedback.validate(b.feedback);ensureCustomerNumbers(b.state);b.state.purchases??=[];
  if(!confirm('Deze back-up vervangt alle huidige CRM-gegevens, bestanden, feedback en ontwerpen'+(b.planning!==undefined?', inclusief het bouwlog':' (het huidige bouwlog blijft behouden)')+'. Doorgaan?'))return;
  await new Promise((resolve,reject)=>{
   beginLocalStateChange();const tx=db.transaction(runtime.mode==='cloud'?['state','files','reports','designs',...(b.planning!==undefined?['planning']:[])]:['state','files'],'readwrite');
   const fs=tx.objectStore('files');fs.clear();b.files.forEach(f=>fs.put(f));tx.objectStore('state').put(b.state,'main');
   if(runtime.mode==='cloud')for(const [name,records] of [['reports',b.feedback],['designs',b.designs],...(b.planning!==undefined?[['planning',b.planning]]:[])]){const target=tx.objectStore(name);target.clear();records.forEach(r=>target.put(r));}
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Terugzetten afgebroken.'));
  });
  if(runtime.mode==='local'){if(b.planning!==undefined)await replaceBuildTasks(company.id,b.planning);await feedback.replaceAll(b.feedback);await replaceDesigns(b.designs);for(let n=localStorage.length-1;n>=0;n--){const key=localStorage.key(n);if(key.startsWith(company.localPrefix))localStorage.removeItem(key);}}
  for(const promise of documentImageUrls.values())promise.then(url=>URL.revokeObjectURL(url)).catch(()=>{});documentImageUrls.clear();
 state=b.state;paymentNotifications.remember(state);state.orders.forEach(syncSingleOrderDelivery);notifyDataChanged();render();toast('Back-up teruggezet');
 }catch(error){failed=true;toast('Import mislukt: '+error.message);}finally{finishLoading({error:failed});}};input.click();
}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;const {action,id}=b.dataset,label=({logout:'Uitloggen…',download:'Bestand ophalen…',export:'Back-up maken…',duplicate:'Order dupliceren…','archive-customer':'Klant archiveren…','archive-order':'Order archiveren…','restore-customer':'Klant herstellen…','restore-order':'Order herstellen…'})[action],key='action:'+action+':'+id;if(label&&loading.isBusy(key))return;const finishLoading=label?loading.begin(label,{key,button:b}):null;let failed=false;try{if(action==='logout'){const offline=await import('./offline/store.js');const pack=await offline.readPack();if(pack&&(pack.uncertain||JSON.stringify(pack.base)!==JSON.stringify(pack.local)))throw Error('Er staan nog offline wijzigingen op dit apparaat. Open Offline werken en synchroniseer die eerst.');if(pack)await offline.updatePack(pack.version,p=>({...p,locked:true}));const response=await fetch('/auth/logout',{method:'POST'});if(!response.ok)throw Error('Uitloggen lukt niet. Probeer opnieuw.');await (await import('./offline/review-store.js')).lockReview();location.replace('/login.html');}else if(action==='delivery-address')deliveryForm(id);else if(action==='order-notes')noteForm(id);else if(action==='costs')costForm(id);else if(action==='planning')planningForm(id);else if(action==='ai-order')aiOrderForm();else if(action==='ai-customer')aiCustomerForm();else if(action==='new-customer')customerForm();else if(action==='edit-customer')customerForm(id);else if(action==='new-order')orderForm(null,id);else if(action==='edit-order')orderForm(id);else if(action==='payment')paymentForm(id);else if(action==='edit-payment'){const p=state.payments.find(x=>x.id===id);paymentForm(p.orderId,id);}else if(action==='add-item'){$('#items').insertAdjacentHTML('beforeend',itemFields(undefined,!b.form?.querySelector('#ai-product-costs')));if(b.form?.querySelector('[name=packagePrice]'))updatePackagePricing(b.form);installOrderCosting(b.form||$('#dialog form'));}else if(action==='remove-item'){if($('#items').children.length===1)toast('Een bestelling heeft minimaal één orderregel.');else b.closest('.item').remove();}else if(action==='sort'){ascending=sort===id?!ascending:true;sort=id;dossierPreferences.setOrderSort(sort+':'+(ascending?'asc':'desc'));render();}else if(action==='upload')upload(id,b.dataset.category);else if(action==='download'){const document=state.documents.find(d=>d.id===id);if(!document)throw Error('Dit document bestaat niet meer.');const name=documentDownloadName(state.documents,document);if(runtime.mode==='cloud'){await downloadBlob(null,name,'/api/crm/files/'+encodeURIComponent(id)+'?name='+encodeURIComponent(name));return;}const f=await store('files','readonly',s=>s.get(id));if(!f)throw Error('Bestand ontbreekt.');await downloadBlob(f.blob,name);}else if(action==='export')await exportBackup();else if(action==='import')await importBackup();else if(action==='duplicate'){
 const original=order(id);if(!original)throw Error('Deze order bestaat niet meer.');const basis=JSON.stringify(original);let copy;
 await mergeStoredState(next=>{
  const current=next.orders.find(order=>order.id===id);if(JSON.stringify(current)!==basis)throw Error('Deze order is intussen gewijzigd. Open haar opnieuw voordat je een kopie maakt.');
  const number=next.orders.reduce((highest,order)=>Math.max(highest,order.number||0),3000)+1;
  copy=copyOrder(current,{number,date:today(),stage:stages[0],newId:uid});next.orders.push(copy);next.activities.unshift({id:uid(),message:`Order #${original.number} gedupliceerd zonder betalingen en bijlagen`,time:new Date().toISOString()});
 });location.hash=`orders/${copy.id}`;render();toast(`Order #${original.number} gedupliceerd zonder betalingen en bijlagen`);
 }else if(['archive-customer','archive-order','restore-customer','restore-order'].includes(action))await dossierActions.archive(action,id);}catch(error){failed=true;toast(error.message);}finally{finishLoading?.({error:failed});}});
document.addEventListener('input',e=>{if(e.target.id==='search'){const pos=e.target.selectionStart,[page]=route();if(page==='orders')orderSearch.text=e.target.value;else if(page==='customers')customerSearch.text=e.target.value;render();const input=$('#search');if(input){input.focus();input.setSelectionRange(pos,pos);}}});
document.addEventListener('change',async e=>{if(e.target.id==='filter'){filter=e.target.value;render();}if(e.target.id==='stage'){const o=order(e.target.dataset.id),stage=e.target.value;e.target.value=o.stage;if(stage!==o.stage)registerOrderProgress(o,stage);}});
installSectionTabs();
window.addEventListener('hashchange',()=>{const [page,key]=route(),section=syncSectionTabs($('#app'),page,key);if(section){currentAssistantPageContext=assistantPageContext({...currentAssistantPageContext,page,section,companyId:company.id});return;}search='';filter='';render();revealSearchResult();if(pendingExternalRefresh)refreshExternalState();});
// Assign missing customer numbers once, reading the latest state atomically.
if(!runtime.offlineReview){
externalRefreshSeq++;
await new Promise((resolve,reject)=>{
 const tx=db.transaction('state','readwrite'),ss=tx.objectStore('state'),r=ss.get('main');let latest,changed=false;
 r.onsuccess=()=>{latest=r.result||state;changed=r.result?ensureCustomerNumbers(latest):false;if(changed)ss.put(latest,'main');};
 tx.oncomplete=()=>{state=latest;if(changed)notifyDataChanged();resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
});
// Bring existing single-order delivery addresses into the shared customer fields.
state.orders.forEach(syncSingleOrderDelivery);
}
render();
automaticPhaseSync.start();

const customerKeys = ['company','contact','email','invoiceEmail','phone','vatNumber','country','billingAddress','shippingAddress','notes'];
const customerPrompt = customerAiPrompt(company);

document.addEventListener('click',async e=>{if(e.target.closest('[data-action="copy-customer-prompt"]')){try{await navigator.clipboard.writeText(customerPrompt);toast('Prompt gekopieerd. Plak hem in ChatGPT met je klantinformatie.');}catch{const text=$('#ai-prompt');text.focus();text.select();toast('Selecteer de prompt en kopieer met Cmd+C of Ctrl+C.');}}});

document.addEventListener('change',e=>{if(e.target.name==='attachments')aiAttachmentFields(e.target.form);});
document.addEventListener('input',e=>{if(e.target.name==='description'&&e.target.closest('#items'))updateAiOrderCosts(e.target.form);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const form=b.form;if(b.dataset.action==='remove-ai-payment')b.closest('.ai-payment').remove();if(b.dataset.action==='add-ai-payment')form.querySelector('#ai-payments').insertAdjacentHTML('beforeend',aiPaymentFields({},Boolean(form.dataset.supplierAi)));if(['add-item','remove-item'].includes(b.dataset.action))updateAiOrderCosts(form);if(b.dataset.action==='copy-order-prompt'){const t=$('#order-prompt');navigator.clipboard.writeText(t.value).then(()=>toast('AI-prompt gekopieerd')).catch(()=>{t.focus();t.select();toast('Kopieer met Cmd+C of Ctrl+C.');});}});

document.addEventListener('change',e=>{if(e.target.name==='autoInvoiceTotal')updateInvoiceTotal();if(e.target.name==='aiPurchaseId')updateAiSupplierChoices(e.target.form);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;try{if(b.dataset.action==='ai-supplier')aiSupplierForm(b.dataset.id);if(b.dataset.action==='add-ai-supplier-line'){const form=b.form;form.querySelector('#supplier-lines').insertAdjacentHTML('beforeend',aiSupplierLineFields({quantity:1,unit:'piece',price:null},form.querySelector('[name=aiPurchaseId]').value));updateInvoiceTotal();}}catch(error){toast(error.message);}});

installNamedCosts({getState:()=>state,openForm,mergeStoredState,render,toast,esc});
installBatchEconomics({getState:()=>state,totals,economics,purchaseInfo,euro});
installBatchPacking(appContext);
installArrivalMail({getState:()=>state,company,compose:emailDraftForm,euro,toast});
installPurchaseWorkflow({getState:()=>state,openForm,mergeStoredState,render,toast,addDocuments,esc});

let showArchivedPurchases=false;
document.addEventListener('change',e=>{if(e.target.id==='show-archived-purchases'){showArchivedPurchases=e.target.checked;renderPurchases();}});

document.addEventListener('input',e=>{if(e.target.closest('.supplier-line')||e.target.name==='total'&&e.target.form?.dataset.supplierAi)updateInvoiceTotal();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;try{const {action,id,purchase:purchaseId,invoice}=b.dataset;if(action==='purchase-tab'){history.replaceState(null,'',`#purchases/${route()[1]}/${id}`);render();}else if(action==='new-supplier-invoice')supplierInvoiceForm(id);else if(action==='edit-supplier-invoice')supplierInvoiceForm(purchaseId,id);else if(action==='supplier-payment')supplierPaymentForm(purchaseId,id);else if(action==='edit-supplier-payment')supplierPaymentForm(purchaseId,invoice,id);else if(action==='add-supplier-line'){$('#supplier-lines').insertAdjacentHTML('beforeend',invoiceLineFields(purchase(id)));updateInvoiceTotal();installCostingPickers($('#dialog form'),{company,direction:'purchase',onChange:updateInvoiceTotal,canPush:()=>$('#dialog form').elements.kind.value==='offer'});}else if(action==='remove-supplier-line'){b.closest('.supplier-line').remove();updateInvoiceTotal();}}catch(error){toast(error.message);}});

document.addEventListener('input',e=>{if(['dutyMode','dutyAmount','dutyBase','dutyRate'].includes(e.target.name))updateDutyPreview();});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;try{const {action,id}=b.dataset;if(action==='new-purchase')purchaseForm();if(action==='edit-purchase')purchaseForm(id);if(action==='link-purchase')linkPurchaseForm(id);if(action==='quote')quoteForm(id);}catch(error){toast(error.message);}});

document.addEventListener('change',e=>{if(e.target.name==='dateUnknown'){const input=e.target.form.querySelector('[name=eventDate]');input.disabled=e.target.checked;input.required=!e.target.checked;}});

document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const {action,id}=b.dataset;if(action==='order-progress'){try{registerOrderProgress(order(id));}catch(error){toast(error.message);}return;}const map={'request-payment':'Wachten op betaling','order-supplier-status':'Besteld bij leverancier','set-production':'In productie','set-transit':'Onderweg naar Nederland','set-arrived':'Binnen in Nederland','set-shipped':'Verzonden','set-completed':'Afgerond','design-ready':'Wachten op goedkeuring','approve-design':'Ontwerp goedgekeurd','quote-sent':'Offerte verstuurd'};if(map[action])try{registerOrderProgress(order(id),map[action],action==='quote-sent');}catch(error){toast(error.message);}});

document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const {action,id}=b.dataset;if(action==='order-tab')selectOrderTab(id);});

document.addEventListener('change',e=>{if(e.target.name==='purchaseId'){const box=e.target.form?.querySelector('[data-inline-purchase]');if(box){box.hidden=e.target.value!=='__new__';for(const input of box.querySelectorAll('input'))input.disabled=box.hidden;}}});

document.addEventListener('change',e=>{if(e.target.name==='customerId'){const box=e.target.form?.querySelector('[data-inline-customer]');if(box){box.hidden=e.target.value!=='__new_customer__';for(const input of box.querySelectorAll('input'))input.disabled=box.hidden;box.querySelector('[name=newCustomerName]').required=!box.hidden;}}});

document.addEventListener('keydown',e=>{const tab=e.target.closest('[role=tab]');if(!tab||tab.hasAttribute('data-section-tab')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')],index=tabs.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;const key=tabs[next].dataset.id,isCustomer=route()[0]==='customers';if(route()[0]==='purchases'){history.replaceState(null,'',`#purchases/${route()[1]}/${key}`);render();document.querySelector(`[data-action="purchase-tab"][data-id="${key}"]`)?.focus();return;}if(isCustomer)selectCustomerTab(key);else selectOrderTab(key);document.getElementById((isCustomer?'customer-tab-':'order-tab-')+key).focus();});

document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 if(b.dataset.action==='billing-address'){billingForm(b.dataset.id);return;}
 if(b.dataset.action!=='billing-use-delivery')return;
 const o=order(b.dataset.id);if(!o||b.disabled)return;const basis=JSON.stringify([o.customerId,o.billing]);b.disabled=true;
 try{
  await mergeStoredState(next=>{const current=next.orders.find(order=>order.id===o.id);if(!current||JSON.stringify([current.customerId,current.billing])!==basis)throw Error('Deze order of het factuuradres is intussen gewijzigd. Open het adres opnieuw met de actuele gegevens.');current.billing={source:'delivery'};next.activities.unshift({id:uid(),message:'Factuuradres volgt het afleveradres',time:new Date().toISOString()});});
  render();toast('Factuuradres volgt het afleveradres');
 }catch(error){toast('Opslaan mislukt: '+error.message);}finally{b.disabled=false;}
});

installFulfilment({getState:()=>state,openForm,mergeStoredState,render,toast,esc});

document.addEventListener('input',e=>{const form=e.target.closest('#delivery-address-form');if(form)updateDeliveryDraft(form);});
document.addEventListener('submit',async e=>{
 const form=e.target;if(form.id!=='delivery-address-form')return;e.preventDefault();
 const key='delivery:'+form.dataset.orderId;if(loading.isBusy(key))return;
 const o=order(form.dataset.orderId);if(!o)return;
 const fields=Object.fromEntries(new FormData(form)),basis=form.dataset.deliveryBasis;
 const activity={id:uid(),message:'Afleveradres van order bijgewerkt',time:new Date().toISOString()};
 const previousInert=form.inert;form.inert=true;form.setAttribute('aria-busy','true');
 const delivery={source:'custom',...Object.fromEntries(['recipient','country','address','instructions'].map(key=>[key,String(fields[key]||'').trim()]))};
 const finishLoading=loading.begin('Afleveradres opslaan…',{key});let failed=false;
 try{
  // Commit before changing the card or its map, keeping failed edits available.
  await mergeStoredState(next=>{
   const current=next.orders.find(order=>order.id===o.id);
   if(!current||!basis||deliveryEditBasis(next,current)!==basis)throw Error('Deze order, klant of adreskoppeling is intussen gewijzigd. Je invoer blijft staan; open het adres opnieuw met de actuele gegevens.');
   current.delivery=delivery;
   const client=next.customers.find(client=>client.id===current.customerId);
   if(client&&next.orders.filter(order=>order.customerId===client.id).length===1)Object.assign(client,{shippingAddress:delivery.address,shippingRecipient:delivery.recipient,shippingCountry:delivery.country,shippingAddressOrderId:current.id});
   next.activities.unshift(activity);
  });
  deliveryDrafts.delete(o.id);render();toast(customerOrders(o.customerId).length===1?'Afleveradres opgeslagen bij klant en order':'Afleveradres opgeslagen voor deze order');
 }catch(error){failed=true;form.inert=previousInert;updateDeliveryDraft(form);form.querySelector('[data-delivery-error]').textContent='Opslaan mislukt: '+error.message;}finally{form.inert=previousInert;form.removeAttribute('aria-busy');finishLoading({error:failed});}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||!['delivery-use-customer','delivery-cancel'].includes(b.dataset.action))return;
 const o=order(b.dataset.id);if(!o)return;
 if(b.dataset.action==='delivery-cancel'){deliveryDrafts.delete(o.id);if(pendingExternalRefresh)refreshExternalState();else render();return;}
 const c=customer(o.customerId),form=$('#delivery-address-form');if(!c?.shippingAddress||!form)return;
 const values=deliveryDetails({},c);for(const key of ['recipient','country','address'])form.elements[key].value=values[key]||'';
 updateDeliveryDraft(form);form.elements.address.focus();
});
window.addEventListener('beforeunload',e=>{if(deliveryDrafts.size){e.preventDefault();e.returnValue='';}});

// Orderkaartfilters worden bij hun eigen werkplek afgehandeld.

document.addEventListener('change',e=>{if(e.target.id==='analytics-period'){analyticsPeriod=e.target.value;renderAnalytics();}});

// Local imports run once per page load; active edits are never replaced.
try{
 const imported=runtime.mode==='cloud'?null:await importLocalOrders({db,stages,companyId:company.id,today:today(),beforeCommit:()=>{if(editingLocally())throw Error('Herlaad na het opslaan om de lokale import over te nemen.');beginLocalStateChange();}});
 if(imported){state=imported.state;paymentNotifications.remember(state);state.orders.forEach(syncSingleOrderDelivery);notifyDataChanged();location.hash=imported.route||`orders/${imported.ids.at(-1)}`;render();toast('Lokale gegevens toegevoegd, inclusief documenten en betalingen');}
}catch(error){toast('Lokale import: '+error.message);}

// Startup migrations are not user actions. History starts after they finish.
sessionUndo.enable();refreshUndoButton();finishStartup();

document.addEventListener('click',event=>{const button=event.target.closest('[data-action="order-costing"]');if(!button)return;try{if(company.tool!=='costing')return;if(!order(button.dataset.id))throw Error('Deze order bestaat niet meer.');orderForm(button.dataset.id,undefined,{}, {focusCosting:true,costingItemId:button.dataset.item||''});}catch(error){toast(error.message);}});

document.addEventListener('click',event=>{const b=event.target.closest('[data-action="choose-order-calculator"]');if(!b||company.tool!=='costing')return;try{const o=order(b.dataset.id);if(!o)throw Error('Deze order bestaat niet meer.');openForm('Voor welk product wil je rekenen?',`<p>Je opent de calculator die bij het gekozen product hoort.</p><div class="actions">${o.items.map(i=>`<a class="download-button" href="${esc(toolUrl(company,o,i,runtime))}">${esc(i.description)} · ${i.quantity} stuks →</a>`).join('')}</div>`,async()=>{});$('#dialog [type=submit]').hidden=true;$('#cancel').textContent='Terug naar order';}catch(e){toast(e.message);}});

// Explicit preparation keeps the normal cloud transaction contract unchanged.
document.addEventListener('click',async event=>{const b=event.target.closest('[data-offline-review]');if(!b)return;event.preventDefault();if(runtime.offlineReview){toast('Je gebruikt de offline-modus al. Feedback kun je hier gewoon bewaren.');return;}if(document.querySelector('dialog[open]')){toast('Bewaar of sluit eerst je open formulier.');return;}b.disabled=true;b.textContent='Offline kopie klaarmaken…';try{await prepareReview(runtime);location.assign('/admin/?offline=review'+(location.hash||'#dashboard'));}catch(error){toast(error.message);b.disabled=false;b.textContent='Offline-modus';}});
