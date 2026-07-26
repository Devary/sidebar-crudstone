import {Injectable} from '@angular/core';
import {ToastMessageOptions} from 'primeng/api';
import {messageLife} from '../sidebar-crudstone.constants';
import {TranslationService} from '../i18n/translation.service';

// this library is read-only (search/pick, never create/edit/delete), so unlike crudstone's own
// MessageTemplateService there's no success/entity/action-templated toast — just a plain error,
// e.g. when a context or its related-entity options fail to load
@Injectable({providedIn: 'root'})
export class MessageTemplateService {

  constructor(private i18n: TranslationService) {
  }

  simpleError(technicalMessage: string): ToastMessageOptions {
    return {
      severity: 'error',
      summary: this.i18n.t('toastErrorSummary'),
      detail: technicalMessage,
      life: messageLife,
    };
  }
}
