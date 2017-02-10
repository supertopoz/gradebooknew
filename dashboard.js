// Display project results. 
var info;
var projectsArr;
var projectNamesArr = projectsArr // ["Project01", "Project02", "Project03", "Project04"];
var projectName;
var projectTitle;
var colors; 
var projectPoints;
var yourScoreArr = [];


// IMORT XML From Google sheet. 
// https://docs.google.com/spreadsheets/d/190pQvYlb56RFUoiikx4GpEBOGTkdUG1x1-7Bmo205eg/edit#gid=0
var spreadsheetID = "190pQvYlb56RFUoiikx4GpEBOGTkdUG1x1-7Bmo205eg";
var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID +
  "/1/public/values?alt=json";
$.getJSON(url, function(incomingData) {
  info = incomingData.feed.entry[0].gsx$xmldata.$t;
  console.log(info);
  // Get the project names and put into an Array
  projectsArr = Object.keys(getProjectScores(info)) 
  projectName = projectsArr [1];
  projectTitle = projectName.split("0").join(" 0");
  // Get the root project scores and put into an array
  getRootProject(info)
  // Get the student's project scores and put into and array
  extractYourProjectScores(getProjectScores(info))
});



function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

// Get student's project scores from XML.  

function getProjectScores() {
  var xml = info, projects = [], projectsObj = {};
  var node = (new DOMParser()).parseFromString(xml, "text/xml").documentElement;
  var nodes = node.querySelectorAll("*");
  var nodesLength = nodes.length;
  for (var y = 0; y < nodesLength; y++) {
    if (nodes[y].parentNode.tagName.indexOf('Project') >= 0) {
      projects.push(nodes[y].parentNode.tagName);
    }
  }
  var projectUnique = projects.filter(onlyUnique);
  //*** Get Project List and scores *** //
  for (var x in projectUnique) {
    var resultsArray = [];
    var projectname = projectUnique[x];
    var proNode = node.getElementsByTagName(projectname)[0];
    var prochildNodes = proNode.childNodes;
    for (var j = 0; j < prochildNodes.length; j++) {
      var proChildValue = prochildNodes[j].textContent;
  // Push student's projects scores to an array.     
      resultsArray.push(proChildValue);

    }
    projectsObj[projectname] = resultsArray;
     //   console.log("results:" + resultsArray)
     //   console.log(projectsObj)
  }
  return projectsObj;
}


// convert project scores

function extractYourProjectScores(projectsObj){
  var incoming = Object.values(projectsObj);  
  for(var items in incoming){
  var a = incoming[items];
  var x= a.map(function(i){
    return parseInt(i, 10);
})
    console.log(">> yourScoreArr");
    yourScoreArr.push(x);
}
console.log(yourScoreArr);
}

// get root project scores from XML

function getRootProject(info) {
  var xml = info,
    rootScores = [],
    rootColors = [],
    rootCategories = [],
    node;
  node = (new DOMParser()).parseFromString(xml, "text/xml").documentElement;
  var nodes = node.querySelectorAll("*");
  console.log("All nodes:" + nodes);
  console.log(nodes);
  var nodesLength = nodes.length;
  for (var i = 0; i < nodesLength; i++) {
    if (nodes[i].parentNode.tagName === "CategoryColors") {
      rootColors.push(nodes[i].childNodes[0].data);
      console.log("Root Colors")
      console.log(nodes[i].childNodes[0].data)
    }
    if (nodes[i].parentNode.tagName === "ProjData" && nodes[i].childNodes[0].data !== undefined) {
      rootScores.push(nodes[i].childNodes[0].data);
    }
    }
    for (var y = 0; y < nodesLength; y++) {
     if (nodes[y].parentNode.tagName === "ProjData" && nodes[y].childNodes[0].tagName !== undefined) {

     	for(var x = 0; x < rootColors.length; x++){
        var catName = nodes[y].childNodes[x].tagName;
        rootCategories.push(catName.replace("_"," "));
     	}
   
    }
  }
  colors = rootColors;

// categories = rootCategories;
 
  projectPoints = rootScores;

  categories = rootCategories.filter(onlyUnique);
}
var yourScore = yourScoreArr[0];
var project = projectName + "_";
var myChart;
function remainingScore(project) {
	var remainingScore = [];
	for (var j = 0; j < projectPoints.length; j++) {
		remainingScore.push(Number(projectPoints[j]) - Number(yourScoreArr[project][j]));
	}
	return remainingScore;

}

// Calculate total project score

function totalScoreCal(project) {
	var totalScore = yourScoreArr[project].reduce(function(a, b) {
    return a + b
	}, 0) //+ "/100";
	return totalScore;
}

// Get colors

function getShadedColors() {
	var reFactoredColors = [];
	for (var rgba in colors) {
		reFactoredColors.push(colors[rgba].replace(", 1)", ", 0.2)"));
	}
	return reFactoredColors;
}
$(".gradebookMenu").on("click", function() {
	$('#Project02_results').empty();
	$('.projectHeader').empty();
	if (myChart !== undefined) {
		myChart.destroy();
	}
	//   myChart.destroy();
	var project = $(this).attr('name') - 1;
	var totalScore = totalScoreCal(project);
	$('.projectHeader').append('<span class="ui mini header projectHeader">Your Score For Project ' + project + ': ' + totalScore + '</span>');
	createChart(dataSchema(project))
	addLegend(project);
});

// Build data schema

function dataSchema(project) {
	var score = yourScoreArr[project];
	var data = {
		labels: categories,
		datasets: [{
			label: 'Your Score',
			data: score,
			backgroundColor: colors,
			borderColor: colors,
			borderWidth: 1
		}, {
			label: 'Total Score',
			data: remainingScore(project),
			backgroundColor: getShadedColors(),
			borderColor: colors,
			borderWidth: 1
		}]
	
	};
//	console.log("colors>>");
//	console.log(colors);
	return data;
}

// Render Chart

function createChart(data) {
	var ctx = document.getElementById("myChart");
	myChart = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			tooltips: {
				titleFontSize: 0,
				titleMarginBottom: 0,
				callbacks: {
					label: function(tooltipItems, data) {
						var dataset = tooltipItems.datasetIndex;
						var title = data.datasets[dataset].label;
						var value = data.datasets[0].data[tooltipItems.index];
						return title + ": " + value;
					}
				}
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					display: false,
					stacked: true,
				}],
				xAxes: [{
					scaleLabel: {
						display: false,
					},
					gridLines: {
						display: false
					},
					stacked: true,
					ticks: {
						display: false,
					}
				}]
			}
		}
	});
	addMoreChartDetails(myChart)
}



function addMoreChartDetails(myChart) {

            
	Chart.pluginService.register({		
		afterDraw: function(chartInstance) {
          
			var ctx = chartInstance.chart.ctx;    
			var chart = myChart.chart;
			var width = chart.width;
			var chartData = chartInstance.data.datasets;
			ctx.font = chart.height / 400 + "em sans-serif";
			ctx.textAlign = 'center';
			ctx.font = '#ffffff';
			ctx.textBaseline = 'bottom';
          
			chartData.forEach(function(dataset) {
				for (var i = 0; i < dataset.data.length; i++) {
					var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
					if (dataset.label === "Your Score") {
						ctx.fillText(dataset.data[i], model.x, model.y + (width / 30));
					}
				}
			});
		}
	});
}

function addLegend(project) {
	$('#legend').empty();
	var data = dataSchema(project);
	var label = "",
		backColor = "",
		id = '',
		labelsList = data.labels;
	// Add labels below Graph
	for (var items in labelsList) {
		if (labelsList.length !== 0) {
			label = data.labels[items];
			backColor = data.datasets[0].backgroundColor[items];
			id = project + label.replace(" ", "_");
			$('#legend').append('<a id="' + id + '" class="ui mini label project' + project + ' legendLabel" style="background-color:' + backColor + '"  >' + label + '</a>');
		}
	}
}




$(document).on('click', '.' + project + 'Label', function() {
	$('.' + project + 'Label').not(this).css("opacity", "1");
	$(this).css("opacity", "0.6");
});


// Uses incoming fixed data about categories + Schema data. 
var catData = "";
var spreadsheetID = "1b_Vuv_D2ekZFsrfCnk0fUgO3wUN82n6xuIDzK6BgSDg";
var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/2/public/values?alt=json";
$.getJSON(url, function(incomingData) {
	catData = incomingData;
	$('#' + project + 'Language').css("opacity", "0.6");
});

function slideDetails(label, color, data) {

	var num = '',
    catNumber = 0;
	$('#results, #resultBox, #unslider-arrow').empty();
//	$('#results').empty();
	var entry = catData.feed.entry;
	var firstChar = label.substring(0, 1);
	var catWithId = label.replace(/_/g, " ").replace(firstChar, " ");
	var category = catWithId.substr(catWithId.indexOf(" ") + 1)
		// Data source is from a Google sheet. 
		// Format the header to match with Google data source
	var catGoogleBlurb = "gsx$" + category.toLowerCase().replace(/ /g, '').replace("&", "").replace("my", "");
	var dataScore = catGoogleBlurb + "score";
	label = data.labels;
	var catPosition = label.indexOf(category);
	var score = data.datasets[0].data[catPosition];
	// Push the text to the chart



	$(entry).each(function() {
		catNumber++;
		if (this[dataScore].$t == score) {
			num = catNumber;
			$('#results').append('<li><div class="ui fluid segment catergory" style="white; background-color:' + color + '; color:white; font-size: 0.9em">' + 
				' <span><strong>Your score for ' + category + ' is ' + score + '</strong></span>' + 
				'<div class="ui divider"></div>' + this[catGoogleBlurb].$t + '</div></li>');
		} else if (this[catGoogleBlurb + "score"].$t !== score) {
			$('#results').append('<li><div class="ui fluid segment catergory" style="font-size: 0.9em">' + 
				' <span><strong>A ' + category + ' score of  ' + 
				this[dataScore].$t + ' means: </strong></span>' + 
				'<div class="ui divider"></div>' + this[catGoogleBlurb].$t + '</div></li>');
		}
	});
	createChevrons(num);
}

function createChevrons(num) {
	$('#category-slider').unslider({
		index: num - 1,
		arrows: {
			//  Unslider default behaviour
			prev: '<a class="unslider-arrow prev"><i class="material-icons">chevron_left</i></a>',
			next: '<a class="unslider-arrow next"><i class="material-icons">chevron_right</i></a>',
		}
	});
}
// Pick up which label was clicked
$(document).on("click", '.legendLabel', function() {
	var label = $(this).attr("id");
	var project = label.substring(0, 1);
	var color = $(this).css('backgroundColor');
	var data = dataSchema(project);
	slideDetails(label, color, data);
});
// Grid set up for gradebook
$('.gradebookMenu').on('click', function() {
	$(this).addClass('disabled')
	$('.gradebookMenu').not(this).removeClass('disabled')
})