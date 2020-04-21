import { TemplateParser } from './template-parser';
import { DOM, StringHTMLTemplate, Binding } from './dom';

/**
 * The interface representing a view model. This will be the core entity of the reactivity system.
 * Every property defined in the application will be part of a view model. Any view model needs to support
 * a few operations.
 */
export interface ViewModel<Model> {
  /**
   * Method to apply the view model and update all the bindings.
   */
  apply(model: Model): ViewModel<Model> & Model;

  /**
   * Method to return the DOM object this view model is bound to.
   */
  el(): DOM;
}

/**
 * The core class for enabling the reactivity system.
 */
export class Mew<Model> implements ViewModel<Model> {
  private callbackRegistry: {
    [key: string]: {
      callbacks: ((newValue: any) => any)[];
    };
  };
  private bindings: Binding[];
  private $el: DOM;

  constructor(private template: StringHTMLTemplate) {
    this.callbackRegistry = {};
    this.bindings = TemplateParser.deriveBindings(this.template);
    this.template = TemplateParser.applyBindings(this.template, this.bindings);
    const { tag, element } = TemplateParser.parse(this.template);
    this.$el = new DOM(tag, element);
    TemplateParser.updateBindings(this.bindings, element);
  }

  apply(model: Model) {
    Object.keys(model).forEach((key) => {
      this.callbackRegistry[key] = this.callbackRegistry[key] || {
        callbacks: [],
      };

      this.bindings
        .filter((binding) => binding.name === key)
        .forEach((binding) => {
          this.callbackRegistry[key].callbacks.push(binding.update);
        });

      const fireCallbacks = (newValue: any) =>
        this.callbackRegistry[key].callbacks.forEach((callback) => callback(newValue));

      let value = JSON.parse(JSON.stringify(model))[key];

      Object.defineProperty(this, key, {
        get: () => value,
        set: (newValue: any) => {
          value = newValue;
          fireCallbacks(newValue);
        },
      });

      fireCallbacks(value);
    });

    return (this as unknown) as ViewModel<Model> & Model;
  }

  el() {
    return this.$el;
  }
}
