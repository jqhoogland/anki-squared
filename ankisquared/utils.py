def pretty_print_widget(widget, level=0, visited=None):
    """Print a Qt widget hierarchy in YAML format.

    Args:
        widget: The Qt widget to print
        level: Current indentation level
        visited: Set of visited widget memory addresses to prevent cycles
    """
    if visited is None:
        visited = set()

    # Prevent infinite recursion from circular references
    widget_addr = str(id(widget))
    if widget_addr in visited:
        return
    visited.add(widget_addr)

    # Print current widget with indentation
    indent = "  " * level
    widget_name = widget.__class__.__name__
    print(f"{indent}{widget_name}:")

    # Print interesting properties
    try:
        if hasattr(widget, "objectName") and widget.objectName():
            print(f"{indent}  objectName: {widget.objectName()}")
        if hasattr(widget, "windowTitle") and widget.windowTitle():
            print(f"{indent}  windowTitle: {widget.windowTitle()}")
    except Exception:
        pass  # Skip any properties that can't be accessed

    # Recursively print children
    children = widget.children()
    if children:
        print(f"{indent}  children:")
        for child in children:
            pretty_print_widget(child, level + 2, visited)
