import * as React from 'react';
import * as d3 from 'd3';
import { useEffect } from 'react';
import { selectCik } from '../../redux/api/conversionsApi';
import { useAppSelector } from '../../redux/reduxHooks';
import { selectUnitDataById } from '../../redux/api/unitsApi';

/**
 * Visual cik graph component
 * @returns D3 force graph visual
 */
export default function CreateCikVisualMapComponent() {
	/* Get unit and Cik data from redux */
	const cikData = useAppSelector(selectCik);
	const units = new Set<number>();
	const unitDataById = useAppSelector(selectUnitDataById);

	/* add all units being used in cik */
	cikData.forEach(unit => (
		units.add(unit.meterUnitId),
		units.add(unit.nonMeterUnitId)
	));

	/* Create data container to pass to D3 force graph */
	const data: { nodes: any[], links: any[] } = {
		nodes: [],
		links: []
	};
	units.forEach(function (value) {
		const unit = unitDataById[value];
		data.nodes.push({'name': unit.name,
			'id': unit.id,
			'typeOfUnit': unit.typeOfUnit
		});
	});
	cikData.map(function (value) {
		data.links.push({
			'source': value.meterUnitId,
			'target': value.nonMeterUnitId,
			'bidirectional': false
		});
	});

	/* Visuals start here */
	useEffect(() => {
		/* View-box dimensions */
		const width = window.innerWidth;
		const height = 1000;

		/* Grab data */
		const nodes = data.nodes.map(d => ({...d}));
		const links = data.links.map(d => ({...d}));

		/* color for nodes (Up to 10 different colors) */
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const simulation = d3.forceSimulation(nodes)
			.force('link', d3.forceLink(links)
				/* Set all link ids (from data.links) */
				.id((d: any) => d.id)
				/* This controls how long each link is */
				.distance(120)
				/* This controls the link strength between nodes */
				// .strength(0.2)
			)
			/* Create new many-body force */
			.force('charge', d3.forceManyBody()
				/* This controls the 'repelling' force on each node */
				.strength(-800)
			)
			/* Create colliding force for nodes */
			// .force('collide', d3.forceCollide().radius(70))
			.force('x', d3.forceX())
			.force('y', d3.forceY());

		const svg = d3.select('#sample-cik')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-width / 2, -height / 2, width, height])
			.attr('style', 'max-width: 100%; height: auto;')
			.append('g');

		/* End arrow head */
		svg.append('defs').append('marker')
			.attr('id', 'arrow-end')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 25)
			.attr('refY', 0)
			.attr('markerWidth', 4)
			.attr('markerHeight', 4)
			/* auto: point towards dest. node */
			.attr('orient', 'auto')
			.append('svg:path')
			.attr('d', 'M0,-5L10,0L0,5');

		/* Link style */
		const link = svg.selectAll('line')
			.data(links)
			.enter().append('line')
			.style('stroke', '#aaa')
			.attr('stroke-width', 3)
			.attr('marker-end', 'url(#arrow-end)');

		/* Node style */
		const node = svg.selectAll('.node')
			.data(nodes)
			.enter().append('circle')
			/* Node radius */
			.attr('r', 20)
			.style('fill', d => color(d.typeOfUnit));

		/* Drag behavior */
		node.call(d3.drag()
			.on('start', dragstart)
			.on('drag', dragged)
			.on('end', dragend));

		/* Node label style */
		const label = svg.selectAll('.label')
			.data(nodes)
			.enter()
			.append('text')
			.text(function (d) { return d.name; })
			.style('text-anchor', 'middle')
			.style('fill', '#000')
			.style('font-family', 'Arial')
			.style('font-size', 14);

		/* Update element positions when moved */
		simulation.on('tick', () => {
			link
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node
				.attr('cx', d => d.x)
				.attr('cy', d => d.y);

			label
				.attr('x', function(d){ return d.x; })
				.attr('y', function (d) {return d.y - 25; });
		});

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragstart(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragend(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}

	}, []); // Empty dependency array to run the effect only once

	return (
		<div>
			<div id="sample-cik"></div>
		</div>
	);
}