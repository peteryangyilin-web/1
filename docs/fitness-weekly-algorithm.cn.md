# 健身资源清单与个性化每周训练推荐算法

检索日期：2026-11-07。用途：个性化健身 app 的内容研究、产品设计与开发交接。

本文提供可实现的规则算法，不是已经验证的医疗处方系统。标记为「指南」的内容来自下列资料；标记为「产品规则」的模板、阈值和排程方式是据此设计的实现方案，需要运动专业人员审核，并通过用户反馈逐步验证。

## 1. 可以使用的网上资源

优先选用机构发布的指南、立场声明和官方动作教学。公开阅读不等于拥有图片、视频、全文或数据库的商业再使用权；在 app 中使用素材前，应逐项确认许可，或自行制作演示。

| ID | 资源与直达链接 | 人群／内容 | 在推荐系统中的用途与边界 |
| --- | --- | --- | --- |
| S01 | [WHO：《身体活动和久坐行为指南》2020](https://www.who.int/publications/i/item/9789240015128/)；[指南作者的完整论文](https://doi.org/10.1136/bjsports-2020-102955) | 儿童青少年、成年人、老年人，以及孕产期、慢性病和残障人群的活动建议 | 年龄分流、每周活动量的长期目标；不是逐个动作的周课表 |
| S02 | [美国 HHS：《Physical Activity Guidelines for Americans》第二版](https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines) | 按人群说明运动种类、时间、强度和渐进方式，可下载完整指南 | 设计整体活动结构与适应期，补充特殊人群原则 |
| S03 | [ACSM 2026 力量训练立场声明全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/)；[官方摘要](https://acsm.org/resistance-training-guidelines-update-2026/) | 健康成年人，涵盖力量、肌肥大、爆发力和身体功能 | 目标对应的抗阻训练参数；不能把健康成人结论直接用于伤病康复或儿童 |
| S04 | [ACSM／Exercise is Medicine：Health Care Providers’ Action Guide](https://www.exerciseismedicine.org/wp-content/uploads/2021/02/EIM-Health-Care-Providers-Action-Guide-clickable-links.pdf) | 运动前筛查、当前活动水平、已知疾病、症状和拟进行的运动强度 | onboarding 的健康筛查及转介逻辑；是否需医疗评估不能只按年龄或 BMI 决定 |
| S05 | [ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/) | 按身体部位、器材、难度分类，提供动作说明和图片，部分有视频 | 建立动作标签、教学内容及替代动作关系；动作库本身不等于周计划算法 |
| S06 | [NHS Strength and Flex：动作教学视频](https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/) | 热身、站姿俯卧撑、深蹲、坐站等动作演示 | 低门槛动作教学的参考；这些是一般训练，不能当作针对疼痛的治疗课程 |
| S07 | [NHS Couch to 5K：完整跑步计划](https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/) | 9 周，每周 3 次，跑走交替，跑步日之间安排休息 | 初学者跑步路径的现成参考；终点是连续跑约 30 分钟，不保证每个人此时都完成 5 km |
| S08 | [NIH／NIDDK：Staying Active at Any Size](https://www.niddk.nih.gov/health-information/weight-management/staying-active-at-any-size) | 各种体型的人如何开始活动，包括步行、水中运动、力量训练和行为建议 | 为活动耐受较低或承重活动不舒适的用户提供选择；不按体重单独判断能力 |
| S09 | [NSCA：Resistance Training for Older Adults](https://www.nsca.com/about-us/position-statements/resistance-training-for-older-adults/) | 老年人的力量、功能、独立生活能力和训练设计 | 老年人模板的专业参考；年龄大不等于没有训练经验 |
| S10 | [NSCA：Youth Resistance Training，2009 立场声明 PDF](https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf) | 儿童青少年的力量训练、教学、监督与渐进 | 独立青少年模块的依据之一；资料年份较早，不能单独作为最新儿童运动政策，也不能直接套成人模板 |
| S11 | [ACOG：Exercise During Pregnancy](https://www.acog.org/womens-health/faqs/exercise-during-pregnancy) | 孕期活动、注意事项、应停止运动的信号 | 孕期专门路径及问答内容；要结合产科建议，产后恢复也应另设路径 |
| S12 | [CDC：How to Measure Physical Activity Intensity](https://www.cdc.gov/physical-activity-basics/measuring/index.html) | 相对强度与说话测试 | 有氧强度提示：中等强度通常能说话但不能唱歌；无需先获得最大心率 |
| S13 | [HYROX 官方规则](https://hyrox.com/rulebook/)；[官方备赛介绍](https://hyrox.com/best-hyrox-preparation/) | 跑步与功能训练站的项目要求、动作标准及备赛要点 | 专项需求与动作标准；比赛规则不是已验证的个性化训练处方，负重按当前赛季与组别核对 |
| S14 | [国家体育总局：《运动处方中国专家共识（2023）》官方解读](https://www.sport.gov.cn/n20001280/n20001265/n20067664/c25517089/content.html) | FITT-VP 框架、适应期／提高期／稳定期、不同人群注意事项 | 中文产品术语和解释层参考；此链接是官方解读，不是共识全文 |

## 2. 从资料中直接提取的核心依据

### 年龄与总体活动量

「指南，S01、S02」健康成年人一般以每周 150–300 分钟中等强度有氧，或 75–150 分钟高强度有氧，或两者等效组合为目标；另在至少 2 天开展覆盖主要肌群的肌肉强化活动。不活跃的人可从较少活动开始，逐步增加，不要求第一周立即达到完整目标。

「指南，S01」5–17 岁平均每天至少 60 分钟中高强度活动，以有氧为主，并在每周至少 3 天包含高强度以及强化肌肉、骨骼的活动。该建议包含体育课、运动、玩耍等，不代表每天都需要一小时健身房训练。

「指南，S01」65 岁及以上保留成人总体活动建议，并在每周至少 3 天安排强调功能性平衡和力量的多成分活动，按能力调整。

### 抗阻训练目标

「指南，S03」更高负荷有利于优化力量提升；增肌可受益于较高周训练量，例如每肌群每周约 10 组或以上。这里的组数是优化参考，不是零基础者第一周必须达到的最低门槛。

「指南，S03」训练不必每组做到力竭；保留约 2–3 次余力是可用的努力程度控制方式。器械、自由重量、弹力带、居家训练均可有效，持续参与和适合个人的安排很重要。

「指南，S12」中等强度有氧时通常可以说话但不能唱歌；高强度时通常需要换气才能继续说几个词。说话测试用于有氧强度，不用于判断一组深蹲的训练负荷。

## 3. 用户数据：四个基本字段之外还需要什么

| 字段 | 建议状态 | 会影响什么 |
| --- | --- | --- |
| age | 必填 | 成人／青少年／老年人模块和功能训练重点 |
| height_cm、weight_kg | 基础档案 | 身体数据趋势、器材适配提示；不直接推算应举的公斤数 |
| primary_goal | 必填，先选一个主目标 | general_health、fat_loss、hypertrophy、strength、endurance、hyrox |
| training_history、technique_familiarity | 必填 | 起始训练量、动作复杂度、负荷标定及是否采用回归训练安排 |
| available_windows | 必填，星期与每次分钟数 | 周计划的真实时间预算，不能只问每周几天 |
| equipment | 必填 | 健身房、哑铃、弹力带、徒手等动作筛选 |
| current_activity | 必填，可填“不清楚” | 最近有氧时间、跑走能力、当前抗阻量；决定起点和进阶速度 |
| health_screen、pain_or_limitations | 必填，允许“不清楚” | 是否适合普通自动计划、哪些动作需避免或专业确认 |
| pregnancy_or_postpartum | 相关用户填写，也可回答“不适用” | 是否进入相应专门路径 |
| preferences | 建议填写 | 喜好、讨厌的活动、室内外、单次训练形式，影响坚持程度 |
| weekly_feedback | 使用后必填或明确缺失 | 实际完成量、次数／负重、余力、疼痛、疲劳、时间障碍 |

体脂率可选，不应因用户没有体脂数据而无法生成普通健身计划。普通力量训练模板无需按性别硬分组；孕产情况、比赛组别等应采集真正相关的信息。

身高不能代表四肢比例或关节活动范围。体重不能代表体能、力量或体脂。可选地显示 BMI = kg / m²，但不把 BMI 用作力量能力、跑步资格或动作禁忌的单独判定。CDC 也指出 BMI 不能区分脂肪、肌肉和骨量：[BMI 说明](https://www.cdc.gov/bmi/about/index.html)。

若缺少训练经验、时间或筛查信息，只提供一般活动建议与待补充字段；不凭身高体重猜出一份声称充分个性化的计划。

## 4. 算法结构与决策顺序

推荐使用「确定性规则与审核过的模板」生成训练，再让语言模型负责中文解释、日历展示和教学问答。所有训练参数与动作 ID 都要能追溯到模板及版本。

决策优先级：安全与适用范围 > 时间和器材约束 > 当前能力与恢复 > 主目标 > 偏好。年龄不是一个线性扣分项。

### 第一步：验证输入并做适用性分流

「指南与产品分流，S04」筛查考虑症状、已知心血管／代谢／肾脏疾病、是否规律运动以及计划强度；不是“超过某岁就必须审批”。

| 情况 | 系统行为 |
| --- | --- |
| 当前胸痛、晕厥、异常呼吸困难等警示情况 | 停止生成或继续训练的流程，提示及时获得医疗评估；严重或持续症状提示急诊处理 |
| 筛查指向需专业评估、病情／限制不清楚 | 输出 review_required 与需确认事项，不给普通高负荷或高强度处方 |
| 妊娠、产后、术后或伤病康复需求 | 进入相应审核过的专门路径；未建立该模块时提供资源与专业转介 |
| 5 岁以下 | 超出本健身房计划引擎范围，转儿童活动资源 |
| 5–17 岁 | 青少年路径，活动多样性、技能与适当监督；不默认提供减重或成人增肌模板 |
| 18–64 岁且适用普通计划 | 成人目标模板 |
| 65 岁及以上且适用普通计划 | 加入功能与平衡需求，再按真实训练经验选难度 |

有残障或慢性病不代表不能运动。其安排应依据具体功能、筛查结果与已明确的专业限制；本原型若无法处理该情况，就说明缺少专门模板，不将其误标为“禁止运动”。

### 第二步：标定起点

「产品规则」冷启动可先区分：新手、规律训练者、停练回归者。分类综合最近训练记录、动作熟悉程度与耐受，不只按“练过几个月”。没有可靠记录时采用新手起点。

首次安排轻负荷教学与试练，以动作稳定、无痛、组末仍有约 3 次余力为起点。无需让零基础用户做 1RM 极限测试。对于不能可靠判断余力的用户，优先提供动作教学、较保守负荷及人工指导入口。

身高用于器械座椅、踏台和握位等调整提醒；具体适配仍需观察。体重可用于跟踪变化及识别“自重动作可能太难，需要调整角度或支撑”的问题，实际难度通过试练确认。

### 第三步：选择目标模板

下表是「产品规则」，为起始框架，不是指南规定每个人必须完成的唯一组合。这里的“次”指训练模块，不一定是不同的日历天；只有符合时长预算时才可合并到同一天。

| 主目标 | 可用起始框架 | 核心个性化逻辑 |
| --- | --- | --- |
| 一般健康 | 每周 2 次全身抗阻，加入 2–3 次可耐受的有氧模块 | 先建立习惯，逐步向指南总量靠近 |
| 减脂 | 保留每周 2–3 次抗阻，并安排有氧 | 不将计划变成只有跑步；以实际完成量和恢复调整，有关饮食另设模块 |
| 增肌 | 新手 2–3 次全身；有经验且时间允许可用 4 天上下肢 | 先适应，再按肌群累计周训练量；约 10 组是优化参考，不强行塞进短时间预算 |
| 力量 | 每周 2–4 次，优先练需要提升的动作 | 技术稳定后再采用更高负荷；主动作放在精力较充足的位置 |
| 心肺／跑步 | 每周 2 次抗阻＋2–3 次有氧；初跑者可接跑走路径 | 先按跑走耐受安排，必要时借鉴 NHS 9 周结构，不承诺固定周数达标 |
| HYROX | 已具备基础者可考虑 2 次力量＋2 次跑步＋1 次短专项技术模块 | 模块可合并；基础不足者先走基础体能路径，不直接上完整比赛模拟 |

减脂不能仅靠训练计划保证体重下降。不要通过体重停滞，自动无限增加有氧，也不要把运动热量估算当作必须“补吃”或“抵扣”的精确数值。

### 第四步：从动作库中筛选并排程

先做硬筛选：器材可用、技术等级匹配、符合已明确的专业限制、时间装得下。再按主目标、熟悉度、喜好和必要变化选择。

成人基础抗阻模板覆盖：膝主导、髋主导、推、拉、核心，并检查肩、手臂、小腿等主要肌群是否得到合适刺激。并非每次都必须包含所有动作模式，但周计划应检查覆盖。

示例替换关系需要预先审核：

| 训练任务 | 低门槛选择 | 进一步选择 | 替换原则 |
| --- | --- | --- | --- |
| 膝主导 | 扶持坐站、箱式深蹲 | 杯式深蹲、器械腿推、杠铃深蹲 | 按技术、器材和实际耐受选择，不能仅按年龄分配 |
| 髋主导／髋伸 | 臀桥、髋铰链教学 | 哑铃罗马尼亚硬拉、其他负重髋伸 | 髋铰链动作先学技术，不凭体重计算杠铃重量 |
| 推 | 墙面／高位俯卧撑 | 器械推胸、哑铃推举等 | 同时核对目标肌群与方向，不能把所有“推”视为完全等价 |
| 拉 | 弹力带划船 | 坐姿划船、下拉、引体向上变式 | 保留水平拉／垂直拉等具体标签 |
| 有氧 | 适合自己的步行或固定单车 | 跑走交替、连续跑等 | 根据能力与偏好选；承重不适时提供耐受更好的选择，不按 BMI 一刀切 |

排程的默认约束为「产品规则」：

1. 新手同一主要肌群的高负荷训练，默认尽量间隔约 48 小时；这是排程偏好，不是对所有训练者都适用的生理硬阈值。
2. 避免将高疲劳下肢训练、艰难跑步与长专项模拟连续堆叠；合并时计算整节课的负荷和时长。
3. 将热身、练习组、正式组、组间休息、换器械、冷身全部计入课时时间。力量训练的全部分钟不能自动算作中等强度有氧。
4. 时间不足时，先减少辅助动作或采用更低周量；不压缩必要休息来假装达标，也不把未获用户同意的散步加到休息日。
5. 主要动作保持相对稳定；不为“个性化”而每周随机换一套动作。

有氧统计可采用 moderate_equivalent_minutes = moderate_minutes + 2 × vigorous_minutes；这只用于公共健康总量的等效统计。它不表示两种训练在疲劳、专项效果和适用人群方面完全相同。

输出时同时显示近期处方与长期参考目标。例如：“本周先安排 60 分钟中等强度有氧；长期逐步争取达到 150 分钟。当前处于适应阶段。”如果时间预算不够，明确显示缺口，不声称已达到建议。

### 第五步：给出组数、次数与努力程度

以下为「产品规则」，依据 S03 的抗阻训练原则选定，需针对模板审核：

| 参数 | 新手默认起点 | 可调整方式 |
| --- | --- | --- |
| 正式组 | 每动作 1–2 组；下面示例用 2 组 | 能稳定完成并恢复良好，再增加必要的组数 |
| 次数 | 常见基础动作每组 8–12 次 | 部分辅助动作可 10–15 次；等长核心用时长，单侧动作说明每侧 |
| 余力 RIR | 通常保留约 3 次，熟悉后约 2–3 次 | RIR=3 指做完后估计还能以合格动作完成约 3 次 |
| 组间休息 | 一般约 90–180 秒，依动作和恢复调整 | 较重、较复杂的动作可更长，不能为凑时间强行缩短 |
| 负重公斤数 | 未标定时为空，显示“通过试练选择” | 根据实际次数、动作与余力记录给下一次负重建议 |

不要把上述次数区间当作唯一有效范围，也不要给所有人固定同一重量。目标为增肌的人，组数按肌群进行周审计；复合动作涉及的主、次肌群分别标记，避免把一组卧推在所有相关肌群中都重复算成完整一组而夸大训练量。

### 第六步：每周更新

原则是“根据表现调整”，不是“每到周一自动加码”。以下阈值均为「产品规则」，不声称是通用生理定律。

| 反馈 | 下一步 |
| --- | --- |
| 同一动作连续 2 次训练所有工作组都达到次数上限、动作稳定、RIR≥2、没有疼痛且恢复正常 | 增加器材允许的最小合理重量，通常可先尝试约 2%–5%；若最小跳重过大，维持重量或先增加次数，不强制加重 |
| 当前负荷下尚未达到次数上限，但动作和恢复良好 | 维持重量，在次数区间内逐渐增加次数 |
| 一次训练意外失败或单次疲劳偏高 | 先维持并核实原因，不凭单次数据判断退步 |
| 连续 2 次出现异常吃力、明显恢复不足或表现下降 | 先排查原因；短期减少约 25%–40% 工作组或降低难度，一周后重新评估 |
| 完成率低于 70% | 询问时间、兴趣、器材或疲劳等原因；因时间不足则缩短课表，不机械降低所有动作重量 |
| 有氧轻松、无不适、恢复正常且时间允许 | 可先给一节课增加约 5 分钟；不要同时增加时间、天数和强度 |
| 新出现关节痛、锐痛、动作后持续或加重的疼痛 | 停止相关动作并评估；不以“坚持一下”或自动加量处理 |
| 出现胸痛、晕厥等警示症状 | 中断训练流程，及时获得医疗帮助 |
| 没有反馈数据 | 保留上周可耐受安排，不自动进阶 |

## 5. 开发用伪代码

```text
generate_week(profile, history, exercise_catalog, reviewed_templates):
    validate_units_and_required_fields(profile)
    if required_fields_missing:
        return needs_input(missing_fields, general_activity_information)

    route = screen_scope_and_health(profile)
    if route.needs_assessment:
        return review_required(route.reasons)
    if no_reviewed_template_for(route.population):
        return specialist_path(route.population, relevant_resources)

    baseline = estimate_baseline(profile.current_activity, history)
    level = classify_using_recent_training_and_skill(profile, history)
    template = choose_reviewed_template(
        population=route.population,
        primary_goal=profile.primary_goal,
        level=level
    )

    dose = choose_tolerable_starting_dose(template, baseline, history)
    candidates = hard_filter(
        exercise_catalog,
        equipment=profile.equipment,
        skill=level,
        reviewed_limitations=route.limitations
    )
    if candidates_do_not_cover_required_tasks:
        return needs_template_review_or_equipment_alternative()

    sessions = fill_template(candidates, dose, profile.preferences)
    sessions = calibrate_loads_from_actual_performance(sessions, history)
    calendar = schedule_within_available_windows(
        sessions,
        profile.available_windows,
        recovery_preferences=template.recovery_rules
    )
    if not_feasible(calendar):
        calendar = reduce_optional_work_and_weekly_dose_then_reschedule()
    if still_not_feasible(calendar):
        return lower_dose_option_and_explicit_constraint_gap()

    audit_time_equipment_muscle_coverage_and_aerobic_totals(calendar)
    return {
        week_calendar: calendar,
        this_week_dose: calculate_prescribed_totals(calendar),
        long_term_guideline_reference: reference_for(route.population),
        guideline_gap: explain_any_shortfall(),
        reasons: explain_decisions(),
        source_ids: template.source_ids,
        template_version: template.version,
        next_review: required_feedback_fields
    }

update_next_week(previous_plan, actual_logs, feedback):
    if safety_signal: return stop_or_assess_relevant_activity()
    if feedback_missing: return maintain_without_automatic_progression()
    handle_adherence_barriers_before_changing_physical_dose()
    apply_exercise_specific_progression_or_regression()
    adjust_aerobic_time_only_if_tolerated_and_time_allows()
    return reschedule_and_repeat_all_audits()
```

## 6. 最小数据结构

```json
{
  "age": 25,
  "height_cm": 175,
  "weight_kg": 85,
  "primary_goal": "fat_loss",
  "training_history": "beginner",
  "technique_familiarity": "needs_instruction",
  "current_activity": {"moderate_minutes_per_week": 0, "vigorous_minutes_per_week": 0},
  "available_windows": [
    {"day": "Mon", "minutes": 60},
    {"day": "Tue", "minutes": 60},
    {"day": "Thu", "minutes": 60},
    {"day": "Sat", "minutes": 60}
  ],
  "equipment": ["gym_machines", "dumbbells", "treadmill"],
  "health_screen": {"result": "eligible_general_plan", "reviewed_limitations": []},
  "preferences": {"cardio": "walking"}
}
```

health_screen.result 应由用户问答和已审核的筛查逻辑生成，不能由用户自行勾选“安全”来代替筛查。

每个动作条目至少包含：exercise_id、名称、动作模式、主／次肌群、器材、难度、教学链接、教学素材许可、适用范围、审核过的限制与替代关系、技术要点、审核人和版本。

每节课输出至少包含：日期、训练类型、预计总时长、热身、动作 ID、组数、次数／时长、每侧说明、负重或标定提示、RIR、休息秒数、有氧分钟及强度、教学入口、替代动作、为什么推荐、需记录的反馈。

## 7. 完整示例：新手减脂第一周

这是前述假设用户的示例，不是用户 Peter 本人的处方。前提：健康筛查适合普通计划、暂无已知限制，动作经教学后可稳定无痛完成。各参数属于产品模板示例。

| 星期 | 内容 | 预计总时间 | 计入的中等强度有氧 |
| --- | --- | --- | --- |
| 一 | 全身 A（含热身、休息、冷身）40 分钟＋步行 10 分钟 | 50 分钟 | 10 分钟 |
| 二 | 逐渐热身后，中等强度步行 20 分钟，再放缓结束 | 约 25 分钟 | 20 分钟 |
| 三 | 休息，不额外塞入必须完成的运动 | 0 | 0 |
| 四 | 全身 B（含热身、休息、冷身）40 分钟＋步行 10 分钟 | 50 分钟 | 10 分钟 |
| 五 | 休息 | 0 | 0 |
| 六 | 逐渐热身后，中等强度步行 20 分钟，再放缓结束 | 约 25 分钟 | 20 分钟 |
| 日 | 休息 | 0 | 0 |

合计：2 次全身抗阻、中等强度有氧 60 分钟、约 150 分钟日历训练时间。150 分钟总训练时间不等于 150 分钟有氧。这里仍低于成人有氧参考目标，属于适应期；后续按反馈和可用时间逐步增加。

| 全身 A | 正式组 × 次数 | 努力程度与休息 |
| --- | --- | --- |
| 杯式深蹲，必要时先用扶持坐站／箱式变式 | 2 × 8–12 | 约 RIR 3；休息 90–180 秒 |
| 器械推胸 | 2 × 8–12 | 同上 |
| 坐姿划船 | 2 × 8–12 | 同上 |
| 臀桥 | 2 × 10–15 | 同上，负重按实际能力 |
| 扶持提踵 | 2 × 10–15 | 可稳定控制后进阶 |
| Dead bug | 2 × 每侧 6–10 | 以动作控制为停止标准 |

| 全身 B | 正式组 × 次数 | 努力程度与休息 |
| --- | --- | --- |
| 轻哑铃罗马尼亚硬拉，先完成髋铰链教学 | 2 × 8–12 | 约 RIR 3；休息 90–180 秒；技术不足则替换为已掌握的髋伸动作 |
| 低踏台上步 | 2 × 每侧 8–10 | 根据稳定性调整踏台高度与支撑 |
| 高位下拉 | 2 × 8–12 | 约 RIR 3 |
| 高位俯卧撑 | 2 × 8–12 | 通过支撑高度调节难度 |
| 轻负荷器械肩推 | 2 × 8–12 | 无痛、动作稳定为前提 |
| 侧平板支撑 | 2 × 每侧 15–25 秒 | 可采用屈膝变式；以控制与呼吸为准 |

实际执行超过 40 分钟时减少辅助工作，保留热身与合理休息。所有公斤数需经试练确定，不能从 85 kg 体重反推。

## 8. 三个不同用户应得到的差异

| 用户 | 推荐方向 | 不应做的简化 |
| --- | --- | --- |
| 25 岁、175 cm、85 kg，新手，目标减脂，每周 4 个时间窗 | 上面的适应期模板，先标定难度与建立完成习惯 | “BMI 高，所以必须天天跑步” |
| 相同年龄、身高体重，但有 2 年可靠训练记录，目标增肌，每周 4 天 | 依据原有可耐受周量安排上下肢框架，审核每肌群组数与恢复，同时保留有氧安排 | 给出与新手完全相同的低量起点，或把同体重当同力量 |
| 70 岁、165 cm、65 kg，有规律训练、筛查适用普通计划 | 依据原有能力保留合适抗阻训练，加入至少 3 天的功能平衡／力量多成分活动，并按可用时间安排有氧 | 仅因年龄大就只允许散步，或把年轻人的全部参数照搬过来 |

## 9. 上线前需要验证的内容

1. 每个年龄／目标模板及替代动作关系经过运动专业人员审核；医疗相关模块由相应专业人士参与。
2. 时间、器材、年龄分流、筛查状态、主要肌群覆盖和重复负荷有自动检查。缺少合适动作时明确失败，不用模型编造。
3. 用真实课时检查预计时长，尤其是单侧动作、换器械和休息；核对周有氧与力量总量没有混算。
4. 小规模验证完成率、负荷感受、疼痛与不良事件、计划理解程度；不把“生成成功”当作“训练有效”。
5. 保存规则版本、来源及审核时间。每次调整可解释是因为表现、时间、偏好还是恢复，避免不透明地突然增加训练。

建议第一版优先覆盖普通成年人一般健康、减脂、增肌和力量目标；老年人、青少年、孕产、康复与 HYROX 逐步用独立审核模板扩展。推荐引擎的价值在于可执行、可解释、可调整，而不是只用四个身体参数输出一份看起来精确的课表。
