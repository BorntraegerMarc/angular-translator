import {provide, NoProviderError, Key, Injector} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http";
import {TranslateService} from '../src/TranslateService';
import {TranslateConfig} from "../src/TranslateConfig";
import {TranslateLoader} from "../src/TranslateLoader";
import {TRANSLATE_PROVIDERS} from "../angular2-translator";

export function main() {
    describe('TranslateService', function () {
        it('is defined', function () {
            expect(TranslateService).toBeDefined();
        });

        describe('constructor', function () {
            it('requires a TranslateConfig', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateService
                ]);

                var action = function () {
                    injector.get(TranslateService);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateConfig));
                providerError.addKey(injector, Key.get(TranslateService));
                expect(action).toThrow(providerError);
            });

            it('requires a TranslateLoader', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TranslateService,
                    provide(TranslateConfig, {useValue: new TranslateConfig({})})
                ]);

                var action = function () {
                    injector.get(TranslateService);
                };

                var providerError = new NoProviderError(injector, Key.get(TranslateLoader));
                providerError.addKey(injector, Key.get(TranslateService));
                expect(action).toThrow(providerError);
            });

            it('predfines providers for default config', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TRANSLATE_PROVIDERS
                ]);
                var translate:TranslateService;

                var action = function () {
                    translate = injector.get(TranslateService);
                };

                expect(action).not.toThrow();
                expect(translate instanceof TranslateService).toBeTruthy();
            });

            it('sets current lang to default lang', function () {
                var injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TRANSLATE_PROVIDERS
                ]);

                var translate:TranslateService = injector.get(TranslateService);

                expect(translate.currentLang()).toBe('en');
            });
        });

        describe('instance', function () {
            var translateConfig:TranslateConfig;
            var translate:TranslateService;

            beforeEach(function () {
                translateConfig       = new TranslateConfig({});
                var injector:Injector = Injector.resolveAndCreate([
                    HTTP_PROVIDERS,
                    TRANSLATE_PROVIDERS,
                    provide(TranslateConfig, {useValue: translateConfig})
                ]);
                translate             = injector.get(TranslateService);
            });

            describe('detect language', function () {
                var mockNavigator:any;

                beforeEach(function () {
                    mockNavigator = {};
                });

                it('detects language by navigator.language', function () {
                    translateConfig.providedLangs = ['bm', 'en'];
                    mockNavigator.language        = 'bm';

                    var detectedLang = translate.detectLang(mockNavigator);

                    expect(detectedLang).toBe('bm');
                });

                it('detects only languages that are provided', function () {
                    translateConfig.providedLangs = ['en'];
                    mockNavigator.language        = 'bm';

                    var detectedLang = translate.detectLang(mockNavigator);

                    expect(detectedLang).toBeFalsy();
                });

                it('using config.langProvided for checking', function () {
                    mockNavigator.language        = 'bm';
                    spyOn(translateConfig, 'langProvided');

                    var detectedLang = translate.detectLang(mockNavigator);

                    expect(translateConfig.langProvided).toHaveBeenCalledWith('bm');
                });

                it('rather checks navigator.languages', function () {
                    translateConfig.providedLangs = ['de-DE', 'de-AT'];
                    mockNavigator.language        = 'de-CH';
                    mockNavigator.languages       = ['de-CH', 'de-AT'];

                    var detectedLang = translate.detectLang(mockNavigator);

                    expect(detectedLang).toBe('de-AT');
                });
            });

            describe('use language', function() {
                it('checks that language is provided using strict checking', function() {
                    spyOn(translateConfig, 'langProvided');

                    translate.useLang('en');

                    expect(translateConfig.langProvided).toHaveBeenCalledWith('en', true);
                });

                it('sets current language to the provided language', function() {
                    translateConfig.providedLangs = ['de/de'];

                    translate.useLang('de-DE');

                    expect(translate.currentLang()).toBe('de/de');
                });

                it('returns false if language is not provided', function() {
                    translateConfig.providedLangs = ['de/de'];

                    var result = translate.useLang('de');

                    expect(result).toBeFalsy();
                });
            });
        });
    });
}