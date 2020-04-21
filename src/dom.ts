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
export class DOM {
  /**
   * The HTMLElement this instance is wrapping over. This will be used as the underlying operator.
   */
  private $el: HTMLElement;

  /**
   * The list of DOM children. The $el property obviously maintains its own list of children, this is
   * just a stripped down version of the actual DOM tree.
   */
  private $children: DOM[];

  constructor(private tag: string, $el: HTMLElement) {
    this.$el = $el;
    this.$children = [];
  }

  /**
   * Method to return the HTMLElement undeneath this DOM object. This should be used if direct access to
   * the HTMLElement is needed in order to pass it to another function. For any other manipulations, use
   * the direct methods in this class.
   */
  el() {
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
    return new DOM(this.$el?.parentElement?.tagName || '', this.$el?.parentElement || document.createElement('div'));
  }

  /**
   * Typeguard to figure out weather an element is a DOM object or an HTMLElement
   * @param element The element to check if it is a DOM object.
   */
  private isDOM(element: DOM | HTMLElement): element is DOM {
    return (element as DOM).el !== undefined;
  }

  /**
   * Method to append a DOM object to the current tree. If an HTMLElement is supplied, it will be wrapped as a DOM object first.
   * @param element The DOM object to be appended.
   */
  append(element: DOM | HTMLElement) {
    if (!this.isDOM(element)) {
      element = new DOM(element.tagName, element);
    }

    this.$el.append(element.$el);
    this.$children.push(element);
  }

  /**
   * Method to append the current tree to another DOM object or HTMLElement.
   * @param element
   */
  appendTo(element: DOM | HTMLElement) {
    if (!this.isDOM(element)) {
      element = new DOM(element.tagName, element);
    }

    element.$el.append(this.$el);
  }
}
