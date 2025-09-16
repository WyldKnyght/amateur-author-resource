import plotly.graph_objects as go
import plotly.io as pio

# Define the components with consistent sizing and better positioning
components = [
    {"name": "User", "layer": "User", "x": 2, "y": 6, "size": 90},
    {"name": "User Auth", "layer": "Security", "x": 2, "y": 5, "size": 90},
    {"name": "Projects Dash", "layer": "Frontend", "x": 0.8, "y": 4, "size": 90},
    {"name": "Story Editor", "layer": "Frontend", "x": 3.2, "y": 4, "size": 90},
    {"name": "Auto-Save Mgr", "layer": "Service", "x": 4.2, "y": 3.5, "size": 90},
    {"name": "Version Ctrl", "layer": "Service", "x": 4.2, "y": 2.5, "size": 90},
    {"name": "Project API", "layer": "Backend API", "x": 0.8, "y": 2.5, "size": 90},
    {"name": "Stories API", "layer": "Backend API", "x": 3.2, "y": 2.5, "size": 90},
    {"name": "Projects Model", "layer": "Database", "x": 0.8, "y": 1, "size": 90},
    {"name": "Content Model", "layer": "Database", "x": 3.2, "y": 1, "size": 90}
]

# Define flows with clear labels
flows = [
    {"from": "User", "to": "User Auth", "label": "Login", "mid_x": 2, "mid_y": 5.5},
    {"from": "User Auth", "to": "Projects Dash", "label": "Auth Access", "mid_x": 1.4, "mid_y": 4.5},
    {"from": "Projects Dash", "to": "Story Editor", "label": "Open Project", "mid_x": 2, "mid_y": 4.2},
    {"from": "Story Editor", "to": "Auto-Save Mgr", "label": "Changes", "mid_x": 3.7, "mid_y": 3.8},
    {"from": "Auto-Save Mgr", "to": "Stories API", "label": "Save", "mid_x": 3.7, "mid_y": 3},
    {"from": "Stories API", "to": "Content Model", "label": "Store", "mid_x": 3.2, "mid_y": 1.8},
    {"from": "Projects Dash", "to": "Project API", "label": "Load", "mid_x": 0.8, "mid_y": 3.3},
    {"from": "Project API", "to": "Projects Model", "label": "CRUD", "mid_x": 0.8, "mid_y": 1.8},
    {"from": "Version Ctrl", "to": "Content Model", "label": "Snapshots", "mid_x": 3.7, "mid_y": 1.8}
]

# Layer colors using the brand colors
layer_colors = {
    "User": "#13343B",
    "Security": "#1FB8CD",
    "Frontend": "#DB4545", 
    "Backend API": "#2E8B57",
    "Database": "#5D878F",
    "Service": "#D2BA4C"
}

# Create the figure
fig = go.Figure()

# Create component lookup
comp_lookup = {comp["name"]: comp for comp in components}

# Add flow arrows and labels
for flow in flows:
    from_comp = comp_lookup[flow["from"]]
    to_comp = comp_lookup[flow["to"]]
    
    # Calculate arrow positioning to avoid overlap with boxes
    dx = to_comp["x"] - from_comp["x"]
    dy = to_comp["y"] - from_comp["y"]
    
    # Adjust start and end points to box edges
    box_offset = 0.2
    if abs(dx) > abs(dy):  # Horizontal flow
        start_x = from_comp["x"] + (box_offset if dx > 0 else -box_offset)
        end_x = to_comp["x"] + (-box_offset if dx > 0 else box_offset)
        start_y = from_comp["y"]
        end_y = to_comp["y"]
    else:  # Vertical flow
        start_x = from_comp["x"]
        end_x = to_comp["x"]
        start_y = from_comp["y"] + (-box_offset if dy < 0 else box_offset)
        end_y = to_comp["y"] + (box_offset if dy < 0 else -box_offset)
    
    # Add arrow line
    fig.add_trace(go.Scatter(
        x=[start_x, end_x],
        y=[start_y, end_y],
        mode='lines',
        line=dict(width=4, color='#333333'),
        showlegend=False,
        hovertemplate=f"{flow['from']} → {flow['to']}<br>{flow['label']}<extra></extra>"
    ))
    
    # Add arrowhead with better visibility
    fig.add_annotation(
        x=end_x,
        y=end_y,
        ax=start_x,
        ay=start_y,
        arrowhead=2,
        arrowsize=2,
        arrowwidth=4,
        arrowcolor='#333333',
        showarrow=True,
        text="",
    )
    
    # Add flow label
    fig.add_annotation(
        x=flow["mid_x"],
        y=flow["mid_y"],
        text=flow["label"],
        showarrow=False,
        font=dict(size=10, color='#333333', family="Arial Bold"),
        bgcolor="rgba(255,255,255,0.9)",
        bordercolor="#cccccc",
        borderwidth=1,
        borderpad=2
    )

# Track which layers we've added to legend
added_layers = set()

# Add components as scatter points with custom markers
for comp in components:
    show_in_legend = comp["layer"] not in added_layers
    if show_in_legend:
        added_layers.add(comp["layer"])
    
    fig.add_trace(go.Scatter(
        x=[comp["x"]], 
        y=[comp["y"]], 
        mode='markers+text',
        marker=dict(
            size=comp["size"],
            color=layer_colors[comp["layer"]],
            symbol='square',
            line=dict(width=3, color='white')
        ),
        text=comp["name"],
        textposition="middle center",
        textfont=dict(size=13, color='white', family="Arial Bold"),
        name=comp["layer"],
        legendgroup=comp["layer"],
        showlegend=show_in_legend,
        hovertemplate=f"{comp['name']}<br>Layer: {comp['layer']}<extra></extra>"
    ))

# Add layer labels with better visibility
layer_positions = [
    {"x": -0.2, "y": 6, "text": "USER LAYER", "color": layer_colors["User"]},
    {"x": -0.2, "y": 5, "text": "SECURITY", "color": layer_colors["Security"]},
    {"x": -0.2, "y": 4, "text": "FRONTEND", "color": layer_colors["Frontend"]},
    {"x": 5.2, "y": 3, "text": "SERVICES", "color": layer_colors["Service"]},
    {"x": -0.2, "y": 2.5, "text": "API LAYER", "color": layer_colors["Backend API"]},
    {"x": -0.2, "y": 1, "text": "DATABASE", "color": layer_colors["Database"]}
]

for pos in layer_positions:
    fig.add_annotation(
        x=pos["x"],
        y=pos["y"],
        text=pos["text"],
        showarrow=False,
        font=dict(size=12, color='white', family="Arial Bold"),
        xanchor="center",
        bgcolor=pos["color"],
        bordercolor="white",
        borderwidth=2,
        borderpad=4
    )

# Update layout
fig.update_layout(
    title="Phase 2: Story Management Architecture",
    xaxis=dict(
        showgrid=False,
        zeroline=False,
        showticklabels=False,
        range=[-0.8, 5.8]
    ),
    yaxis=dict(
        showgrid=False,
        zeroline=False,
        showticklabels=False,
        range=[0.3, 6.7]
    ),
    plot_bgcolor='white',
    legend=dict(
        orientation='h',
        yanchor='bottom',
        y=1.02,
        xanchor='center',
        x=0.5,
        title="System Layers"
    )
)

fig.update_traces(cliponaxis=False)

# Save the chart
fig.write_image("chart.png")
fig.write_image("chart.svg", format="svg")

fig.show()