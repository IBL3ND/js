//51吃瓜组件  官网 https://www.chigua.com
export default async function(ctx) {
  const family = ctx.widgetFamily || 'systemMedium';
  let maxItems = 3;
  if (family === 'systemSmall') maxItems = 2;
  else if (family === 'systemMedium') maxItems = 3;
  else if (family === 'systemLarge' || family === 'systemExtraLarge') maxItems = 7;

  let items = [];
  let errorMsg = null;

  try {
    const resp = await ctx.http.get('https://chigua.com/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      },
      timeout: 12000
    });
    const xml = await resp.text();
    const regex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null && items.length < maxItems + 3) {
      let title = match[1]
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      let link = match[2]
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .trim();
      link = link.replace(/https?:\/\/(www\.)?51cg1\.com/i, 'https://chigua.com');

      if (/双11|活动|抽奖|入瓜仪式|福利|限时/.test(title)) continue;

      items.push({
        title: title,
        url: link
      });
      if (items.length >= maxItems) break;
    }
  } catch (e) {
    errorMsg = '加载失败';
  }

  const textMain = { light: '#1C1C1E', dark: '#F2F2F7' };
  const textSub  = { light: '#8A8A8E', dark: '#98989F' };
  const accent   = '#FF2D55';

  if (errorMsg || items.length === 0) {
    return {
      type: 'widget',
      padding: 16,
      gap: 8,
      children: [
        {
          type: 'text',
          text: '51吃瓜',
          font: { size: 'headline', weight: 'bold' },
          textColor: accent
        },
        {
          type: 'text',
          text: errorMsg || '暂无内容',
          font: { size: 'body' },
          textColor: textSub
        }
      ]
    };
  }

  const isLarge = family === 'systemLarge' || family === 'systemExtraLarge';

  const children = [
    {
      type: 'stack',
      direction: 'row',
      alignItems: 'center',
      children: [
        {
          type: 'text',
          text: '51吃瓜',
          font: { size: 'headline', weight: 'bold' },
          textColor: accent
        },
        { type: 'spacer' },
        {
          type: 'text',
          text: '实时',
          font: { size: 'caption1' },
          textColor: textSub
        }
      ]
    }
  ];

  items.forEach((item, index) => {
    children.push({
      type: 'text',
      text: item.title,
      font: { size: 14 },
      textColor: textMain,
      maxLines: 3,
      minScale: 0.75,
      url: item.url          
    });


    if (isLarge && index < items.length - 1) {
      children.push({ type: 'spacer' });
    }
  });

  if (isLarge) {
    children.push({ type: 'spacer' });
  }

  return {
    type: 'widget',
    padding: [12, 14, 12, 14],
    gap: isLarge ? 0 : 8,
    children: children,
    refreshAfter: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  };
}
