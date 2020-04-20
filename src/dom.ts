/**
 * Represents HTML code as a String.
 */
export type StringHTMLTemplate = string;

/**
 * The basic unit of the reactivity system. The binding object connects a DOM object to the view model.
 */
export interface Binding {
  /**
   * The ID of the binding. Every binding must have a unique ID.
   */
  id: number | string;

  /**
   * The text used to create the binding in the real DOM.
   */
  text: string;

  /**
   * This will be the parsed version of the text property.
   * Useful when some of the characters in the text are not
   * useful beyond actually identifying the binding.
   */
  name: string;

  /**
   * The current value of the binding. This value will be in the innerText of the DOM associated.
   */
  value: any;

  /**
   * The DOM object this binding is bound to.
   */
  $el: DOM;

  /**
   * The method to update the binding.
   * @param newValue The new value of the binding.
   */
  update(newValue: any): void;
}

/**
 * A simple DOM wrapper to easily create and manage DOM elements.
 * This class will abstract all communication with the browser
 * document object model.
 */
export default class DOM {
  /**
   * The HTMLElement this instance is wrapping over. This will be used as the underlying operator.
   */
  private $el: HTMLElement;

  /**
   * The list of DOM children. The $el property obviously maintains its own list of children, this is
   * just a stripped down version of the actual DOM tree.
   */
  private $children: Array<DOM>;

  constructor(private tag: string, $el?: HTMLElement) {
    this.$el = $el || new HTMLUnknownElement();
    this.$children = [];
  }

  /**
   * Method to return the HTMLElement undeneath this DOM object. This should be used if direct access to
   * the HTMLElement is needed in order to pass it to another function. For any other manipulations, use
   * the direct methods in this class.
   */
  el() {
    if (!this.$el) {
      this.$el = document.createElement(this.tag);
    }

    return this.$el;
  }

  /**
   * Method to return the children DOM objects under this DOM object.
   */
  children() {
    return this.$children;
  }

  /**
   * Method to return the parent DOM object of the current DOM object. The parent is figured out at the
   */
  parent() {
    return new DOM(
      this.$el?.parentElement?.tagName || '',
      this.$el?.parentElement || new HTMLUnknownElement()
    );
  }

  /**
   * Typeguard to figure out weather an element is a DOM object or an HTMLElement
   * @param element The element to check if it is a DOM object.
   */
  private isDOM(element: DOM | HTMLElement): element is DOM {
    return (element as DOM).el !== undefined;
  }

  /**
   * Method to append a DOM object.
   * @param element The DOM object to be appended.
   */
  append(element: DOM): void;

  /**
   * Method to wrap an HTMLElement in a DOM object and then append it to the current tree.
   * @param element The HTMLElement to be appended.
   */
  append(element: HTMLElement): void;
  append(element: DOM | HTMLElement) {
    if (!this.isDOM(element)) {
      element = new DOM(element.tagName, element);
    }

    this.$el.append(element.$el);
    this.$children.push(element);
  }
}

/**
 * Class used to parse HTML strings for special tokens.
 */
export class TemplateParser {
  private static _id = 0;
  private static id = () => `${++TemplateParser._id}-${new Date().getTime()}`;
  private static identifyingAttribute = 'data-mew-id';

  static bindingParser = (bindingString: string) => bindingString.substring(1);
  /**
   * Method to return an HTMLElement from a template string.
   * @param template The template string to parse.
   */
  static parse = (template: StringHTMLTemplate) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;
    return {
      tag: wrapper.firstElementChild?.tagName as string,
      element: wrapper.firstElementChild as HTMLElement,
    };
  };

  /**
   * Helper function to derive bindings from an HTML string template.
   */
  static deriveBindings = (template: StringHTMLTemplate) => {
    const regex = /:\w+/g;

    return (
      template.match(regex)?.map<Binding>(
        (bindingString) =>
          ({
            id: TemplateParser.id(),
            text: bindingString,
            name: TemplateParser.bindingParser(bindingString),
          } as Binding)
      ) || []
    );
  };

  /**
   * Helper function to apply bindings to an HTML string template.
   */
  static applyBindings = (
    template: StringHTMLTemplate,
    bindings: Array<Binding>
  ): StringHTMLTemplate => {
    bindings.forEach((binding) => {
      template.replace(
        new RegExp(`${binding.text}`),
        `<span ${TemplateParser.identifyingAttribute}="${binding.id}">&lt;#${binding.name} not applied&gt;</span>`
      );
    });

    return template;
  };

  /**
   * Helper function to update the bindings with their bound DOM object.
   */
  static updateBindings = (bindings: Array<Binding>) => {
    bindings.forEach((binding) => {
      const $el = document.querySelector(
        `[${TemplateParser.identifyingAttribute}="${binding.id}"]`
      );
      binding.$el = new DOM($el?.tagName as string, $el as HTMLElement);
      binding.update = (newValue) =>
        (binding.$el.el().innerText = `${newValue}`);
    });
  };
}
