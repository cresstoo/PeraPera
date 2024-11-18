# 日语口语评分算法

## 1. 总体评分结构
总分 = 发音得分（70%）+ 语法得分（30%）

### 1.1 发音评分（70分）
使用 Azure Speech Service 的评分指标：
- 准确度（Accuracy）
- 流畅度（Fluency）
- 完整度（Completeness）
- 音素级别评分（Phoneme Level）

### 1.2 语法评分（30分）
使用 MeCab 进行形态素分析，评估：
- 结构完整性（35%）
- 谓语使用（25%）
- 助词使用（20%）
- 语序正确（10%）
- 复杂度加分（最多10%）

## 2. 语法评分详细算法

### 2.1 基本句型识别
1. 感叹词/语气词
   - すみません
   - ありがとう
   - はい/いいえ
   
2. 简单句型
   - 名词 + です
   - 形容动词 + です
   - 形容词 + です

3. 基本句型
   - 主语 + は + 谓语
   - 名词 + を + 动词
   - 名词 + に + 动词

4. 复杂句型
   - 多重助词
   - 复合谓语
   - 从句结构

### 2.2 评分标准
1. 结构分（35分）
   - 主语/主题存在（+15）
   - 谓语存在（+10）
   - 修饰语正确（+10）

2. 谓语分（25分）
   - 动词使用正确（+10）
   - 时态正确（+5）
   - 语体一致（+5）
   - 补助动词正确（+5）

3. 助词分（20分）
   - 基本助词正确（は、が、を等）（+10）
   - 补充助词正确（に、で等）（+10）

4. 语序分（10分）
   - 基本语序正确（+5）
   - 修饰语位置正确（+5）

5. 复杂度加分（最多10分）
   - 多重助词使用（+2）
   - 复合谓语（+2）
   - 修饰语（+2）
   - 时间表达（+2）
   - 从句结构（+2）

## 3. 特殊情况处理

### 3.1 感叹词处理
- 直接给满分（100分）
- 不考虑结构复杂度

### 3.2 简单句型处理
- 直接给满分（100分）
- 不要求主语存在

### 3.3 口语省略处理
- 允许省略主语
- 允许省略某些助词
- 不因省略扣分

## 4. 待优化项目
- [ ] 完善复杂句型识别
- [ ] 优化复杂度评估
- [ ] 添加更多语法模式
- [ ] 改进口语省略判断
- [ ] 优化评分权重

## 5. 参考资料与引用

### 5.1 语音评估
- Azure Speech Service Pronunciation Assessment
  - [官方文档](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-assessment)
  - [API 参考](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text)

### 5.2 语法分析
- MeCab 形态素分析器
  - [官方仓库](https://taku910.github.io/mecab/)
  - [Node.js 封装](https://github.com/hecomi/node-mecab-async)

### 5.3 评分算法参考
- JWriter 作文评价系统
  - [官方网站](https://jreadability.net/jev/)
  - 相关论文：李在鎬, 伊集院郁子, 青木優子, 長谷部陽一郎,村田裕美子（2021）「論理的文章の自動評価に関する研究ーアカデミック・ライティングへの貢献を目指して」『2021年度日本語教育学会春季大会予稿集』pp. 223-226

- 日语口语评估研究
  - Lee, Jae-Ho & Hasebe, Yoichiro (2020) Quantitative Analysis of JFL Learners' Writing Abilities and the Development of a Computational System to Estimate Writing Proficiency. Learner Corpus Studies in Asia and the World 5, pp. 105-120

### 5.4 语料库
- I-JAS（多言語母語の日本語学習者横断コーパス）
  - [官方网站](https://ninjal-sakura.ninjal.ac.jp/lsaj/)
  - 用于评分标准的基准数据

### 5.5 语法参考
- 市川孝（1978）『国語教育のための文章論概説』（教育出版）
- 石黒圭（2008）『文章は接続詞で決まる』（光文社新書）

## 6. License
本评分算法基于以上开源项目和研究成果，遵循 MIT License。
使用了 Azure Speech Service 的商业服务需遵循其服务条款。

## 7. 待优化项目
- [ ] 完善复杂句型识别
- [ ] 优化复杂度评估
- [ ] 添加更多语法模式
- [ ] 改进口语省略判断
- [ ] 优化评分权重