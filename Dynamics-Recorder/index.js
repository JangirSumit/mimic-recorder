const RECORDER = [];
let EVENT_PROCESSOR = {
  currentEvent: undefined,
  currentElement: undefined,
  events: [],
};

initializeConstants();
initializeCommonMethods();
initializeListeners();

function initializeConstants() {
  const constants = {
    ELEMENT_TYPES: {
      None: 0,
      ToggleButtonCheckbox,
      CustomCheckbox,
      CheckmarkCheckbox,
      TreeViewCheckbox,

      InputDropdown,
      DynamicDropdown,
      TextboxDropdown,
      FlyoutContainerDropdown,

      DefaultRadioButton,

      DefaultLink,
    },
    ELEMENT_CATEGORIES: {
      None,
      Checkbox,
      Dropdown,
      RadioButton,
    },
    EVENT_TYPES: {
      Click: "Click",
    },
  };
}

function initializeCommonMethods() {
  function getElementsByXpath(path, parent) {
    this.logMessage("Path, Parent", path, parent);

    const result = document.evaluate(
      path,
      parent || document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const elements = [];

    for (let index = 0; index < result.snapshotLength; index++) {
      elements.push(result.snapshotItem(index));
    }

    this.logMessage("getElementsByXpath output is", elements);

    return elements;
  }

  function getElementByXpath(path, parent) {
    this.logMessage("Path, Parent", path, parent);

    const element = document.evaluate(
      path,
      parent || document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    this.logMessage("getElementByXpath output is", element);
    return element;
  }
}

function initializeExtensionMethods() {
  if (!String.prototype.equals) {
    String.prototype.equals = function (value, ignoreCase = true) {
      if (ignoreCase) {
        return this.toLowerCase() === value.toLowerCase();
      }
      return this === value;
    };
  }

  if (!Node.prototype.canInteract) {
    Node.prototype.canInteract = function () {
      return document.documentAPI.canInteract(this);
    };
  }

  if (!HTMLElement.prototype.hasClasses) {
    HTMLElement.prototype.hasClasses = function () {
      const classes = arguments;
      const classList = this.classList;

      for (const element of classes) {
        if (!classList.contains(element)) {
          return false;
        }
      }
      return true;
    };
  }
}

const RULES_ENGINE = [
  {
    metadata: {
      elementCategory: constants.ELEMENT_CATEGORIES.Checkbox,
      elementType: constants.ELEMENT_TYPES.ToggleButtonCheckbox,
    },
    rules: [
      function (event) {
        const targetElement = event.targetElement;

        return (
          event.eventType.equals(constants.EVENT_TYPES.Click) &&
          targetElement.tagName.equals("span") &&
          targetElement.role?.equals("switch") &&
          targetElement.classList.contains("toggle-box")
        );
      },
    ],
  },
  {
    metadata: {
      elementCategory: constants.ELEMENT_CATEGORIES.RadioButton,
      elementType: constants.ELEMENT_TYPES.DefaultRadioButton,
    },
    rules: [
      function (event) {
        const targetElement = event.targetElement;

        let result = false;
        let parentDiv;

        switch (targetElement.tagName.toLowerCase()) {
          case "input":
            result = targetElement.type?.equals("radio");
            break;

          case "label":
            parentDiv = targetElement.closest("div.layout-container");
            if (parentDiv) {
              let radioElements = parentDiv.querySelectorAll(
                "input[type='radio']"
              );
              result = radioElements?.length > 0;
            }
            break;

          case "span":
          case "div":
            parentDiv = targetElement.closest(
              "div.group_content.layout-container"
            );
            if (parentDiv) {
              let radioElements = parentDiv.querySelectorAll(
                "input[type='radio']"
              );
              result = radioElements?.length > 0;
            }
            break;
        }

        return event.eventType === constants.EVENT_TYPES.Click && result;
      },
    ],
  },
  {
    metadata: {
      elementCategory: constants.ELEMENT_CATEGORIES.Dropdown,
      elementType: constants.ELEMENT_TYPES.InputDropdown,
    },
    rules: [
      function (event) {
        const targetElement = event.targetElement;

        let parentElement =
          targetElement.closest(".lookupDock-dockContainer") ||
          targetElement.closest(".input_container") ||
          targetElement.closest(".public_fixedDataTableCell_cellContent");

        return (
          event.eventType === constants.EVENT_TYPES.Click &&
          targetElement.tagName.equals("input") &&
          targetElement.role?.equals("combobox") &&
          parentElement?.querySelector(".lookupButton") &&
          targetElement.getAttribute("aria-controls") !== "ui-datepicker-div" &&
          !targetElement
            .closest("div")
            ?.getAttribute("data-dyn-controlname")
            ?.startsWith("FiscalCalendarPeriodFilter_")
        );
      },
      function (event) {
        const targetElement = event.targetElement;

        return (
          event.eventType === constants.EVENT_TYPES.Click &&
          (targetElement.tagName.equals("input") ||
            targetElement.tagName.equals("div")) &&
          getElementsByXpath(
            "parent::div//div[@role ='gridcell']//input[@type='text'][@role = 'textbox']|self::input[@type='text'][@role = 'textbox']|parent::div//input[@type='text'][@role = 'textbox']",
            targetElement
          ) &&
          getElementByXpath(
            "ancestor::form[not(div//div[contains(@class,'right-splitter')])]",
            targetElement
          )
        );
      },
    ],
  },
];

function initializeListeners() {
  window.addEventListener("click", handleClick, true);
  window.addEventListener("pointerdown", handlePointerdown, true);
  window.addEventListener("dblclick", handleDblClick, true);
  window.addEventListener("input", handleInput, true);
}

function handleClick(event) {
  console.log("click event");
}

function handlePointerdown(event) {
  if (event.pointerType === "mouse" && event.button === 0) {
    console.log("pointer down event");
  }
}

function handleDblClick(event) {
  console.log("double click event");
}

function handleInput(event) {
  console.log("input event");
}
