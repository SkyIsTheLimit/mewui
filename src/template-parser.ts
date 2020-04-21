import { StringHTMLTemplate, Binding, DOM } from './dom';
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
          } as Binding),
      ) || []
    );
  };

  /**
   * Helper function to apply bindings to an HTML string template.
   */
  static applyBindings = (template: StringHTMLTemplate, bindings: Binding[]): StringHTMLTemplate => {
    bindings.forEach((binding) => {
      template = template.replace(
        new RegExp(`${binding.text}`),
        `<span ${TemplateParser.identifyingAttribute}="${binding.id}">&lt;#${binding.name} not applied&gt;</span>`,
      );
    });

    return template;
  };

  /**
   * Helper function to update the bindings with their bound DOM object.
   */
  static updateBindings = (bindings: Binding[], container: HTMLElement) => {
    bindings.forEach((binding) => {
      const queryString = `[${TemplateParser.identifyingAttribute}="${binding.id}"]`;
      const $el = container.querySelector(queryString);
      binding.$el = new DOM($el?.tagName as string, $el as HTMLElement);
      binding.update = (newValue) => {
        return (binding.$el.el().innerText = `${newValue}`);
      };
    });
  };
}
