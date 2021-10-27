const m = 50
const margin = ({ top: m, right: m, bottom: m, left: m })
const width = 1000 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

d3.csv('driving.csv', d3.autoType).then(data => {

	var svg = d3.selectAll('#chart')
		.append('svg')
		.attr('viewBox', [0, 0, 
			width + margin.left + margin.right, 
			height + margin.top + margin.bottom])
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	var xScale = d3.scaleLinear()
		.domain(d3.extent(data, d => d.miles))
		.nice()
		.range([0, width])
	
	var yScale = d3.scaleLinear()
		.domain(d3.extent(data, d => d.gas))
		.nice()
		.range([height, 0])
		
	var xAxis = d3.axisBottom()
		.scale(xScale)

	var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(null, '$.2f')

	svg.append('g')
		.attr('class', 'axis x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis)
		.call(g => g.select('.domain').remove())
		.selectAll('.tick line')
		.clone()
		.attr('y1', -1 * height)
		.attr('y2', 0)
		.attr('stroke-opacity', 0.15)

	svg.append('g')
		.attr('class', 'axis y-axis')
		.call(yAxis)
		.call(g => g.select('.domain').remove())
		.selectAll('.tick line')
		.clone()
		.attr('x2', width)
		.attr('stroke-opacity', 0.15)
		
	svg.append('text')
		.attr('x', -36)
		.attr('y', -24)
		.attr('text-anchor', 'start')
		.attr('font-size', 14)
		.attr('fill', '#5b5b5b')
		.text('Cost per gallon')
		.call(halo)

	svg.append('text')
		.attr('x', width + 8)
		.attr('y', height + 44)
		.attr('text-anchor', 'end')
		.attr('font-size', 14)
		.attr('fill', '#5b5b5b')
		.text('Miles driven per person')
		.call(halo)

	const line = d3.line()
		.curve(d3.curveCatmullRom)
		.x(d => xScale(d.miles))
		.y(d => yScale(d.gas))
		
	function length(path) {
		return d3.create('svg:path').attr('d', path).node().getTotalLength()
	}

	const len = length(line(data))
	
	svg.append('path')
		.datum(data)
		.attr('fill', 'transparent')
		.attr('stroke', 'black')
		.attr('stroke-linejoin', 'round')
		.attr('stroke-width', 4)
		.attr('d', line)
		.attr('stroke-dasharray', `0,${len}`)
		.transition()
		.duration(4000)
		.ease(d3.easeLinear)
		.attr('stroke-dasharray', `${len},${len}`)
		
	svg.selectAll('circle')
		.data(data)
		.join('circle')
		.attr('class', 'circles')
		.attr('cx', d => xScale(d.miles))
		.attr('cy', d => yScale(d.gas))
		.attr('r', 4.2)
		.attr('stroke', 'black')
		.attr('fill', 'white')

	const labels = svg.append('g')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 12)
		.attr('fill', '#5b5b5b')
		.selectAll('g')
		.data(data)
		.join('g')
		.attr('transform', d => `translate(${xScale(d.miles)},${yScale(d.gas)})`)
		.attr('opacity', 0)
  
	labels.append('text')
		.text(d => d.year)
		.each(position)
		.call(halo)

	labels.transition()
		.delay((d, i) => length(line(data.slice(0, i + 1))) / len * (3900))
		.attr('opacity', 1)

	function position(d) {
		const t = d3.select(this)
		switch (d.side) {
		case 'top':
			t.attr('text-anchor', 'middle').attr('dy', '-0.7em')
			break
		case 'right':
			t.attr('dx', '0.5em')
			.attr('dy', '0.32em')
			.attr('text-anchor', 'start')
			break
		case 'bottom':
			t.attr('text-anchor', 'middle').attr('dy', '1.4em')
			break
		case 'left':
			t.attr('dx', '-0.5em')
			.attr('dy', '0.32em')
			.attr('text-anchor', 'end')
			break
		}
	}

	function halo(text) {
		text
		.select(function() {
			return this.parentNode.insertBefore(this.cloneNode(true), this)
		})
		.attr('fill', 'white')
		.attr('stroke', 'white')
		.attr('stroke-width', 4)
		.attr('stroke-linejoin', 'round')
	}

});