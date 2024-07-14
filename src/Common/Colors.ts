import { DefaultTheme, MD3Theme } from "react-native-paper";

const FireflyColors: string[] = [
	"#616c8c",
	"#568c87",
	"#b2d59b",
	"#f2de79",
	"#d95f18",
];

const FireflyTheme: MD3Theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: FireflyColors[1],				// 主色，通常用于主要按钮和状态栏
		primaryContainer: FireflyColors[2],		// 主要颜色容器，用于按钮的容器背景
		secondary: FireflyColors[1],			// 次要颜色，用于次级按钮和状态栏
		secondaryContainer: FireflyColors[2],	// 次失颜色容器
		tertiary: FireflyColors[3],				// 第三颜色，可以用于强调颜色
		onPrimary: '#FFFFFF',					// 在主颜色上的文本颜色
		onSecondary: '#FFFFFF',					// 在次要颜色上的文本颜色
		onTertiary: '#000000',					// 在第三颜色上的文本颜色
		error: FireflyColors[4],				// 错误颜色
		onError: '#FFFFFF',						// 在错误颜色上的文本颜色
		background: FireflyColors[0],			// 背景颜色
		surface: '#FFFFFF',						// 元素的表面颜色
		onBackground: '#000000',				// 背景上的文本颜色
		onSurface: '#000000',					// 表面上的文本颜色
		outline: FireflyColors[0],				// 轮廓颜色，用于按钮边框等
		surfaceVariant: FireflyColors[2],		// 表面变体颜色，一种附加表面颜色
		onSurfaceVariant: '#000000',			// 在表面变体上的文本颜色
		outlineVariant: FireflyColors[0],      	// 轮廓的变体颜色
		inverseSurface: '#000000',				// 反向表面颜色
		inverseOnSurface: '#FFFFFF',			// 反向表面上的文本颜色
		inversePrimary: FireflyColors[1],		// 反向主颜色
		shadow: '#000000',						// 阴影颜色
		scrim: '#000000',						// 幕布颜色
	},
};

export const CustomTheme = FireflyTheme;
