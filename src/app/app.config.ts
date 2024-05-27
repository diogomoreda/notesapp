import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { ServerService } from './services/server.service';


export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes), 
        provideAnimationsAsync(),
        provideMarkdown(),
        ServerService,
        {
            provide: APP_INITIALIZER,
            useFactory: (serverService: ServerService) => () => serverService.reset(),
            deps: [ServerService],
            multi: true
        }
    ]
};
